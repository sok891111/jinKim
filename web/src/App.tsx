import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import './App.css'
import { QUESTIONS, type Question } from './data/questions'
import { WordCard } from './components/WordCard'
import { DroppableSlot } from './components/DroppableSlot'

const BANK_ID = 'bank'
const SENTENCE_ID = 'sentence-area'
const blankContainerId = (blankId: string) => `blank:${blankId}`

type Item = {
  id: string
  text: string
}

type Containers = Record<string, string[]> // containerId -> itemIds

type Grade = {
  correctCount: number
  total: number
  byBlankId: Record<string, boolean>
}

function normalize(s: string) {
  return s.trim().toLowerCase()
}

function buildItems(question: Question): Item[] {
  // allow duplicate words by giving each instance a unique id
  return question.wordBank.map((text, i) => ({ id: `w${i}`, text }))
}

function findContainer(containers: Containers, id: string): string | null {
  if (id in containers) return id
  for (const [containerId, itemIds] of Object.entries(containers)) {
    if (itemIds.includes(id)) return containerId
  }
  return null
}

function QuestionSession({
  question,
  idx,
  total,
  onNext,
}: {
  question: Question
  idx: number
  total: number
  onNext: () => void
}) {
  const { setNodeRef: setSentenceRef, isOver: isOverSentence } = useDroppable({ id: SENTENCE_ID })

  const blanks = useMemo(() => {
    return question.tokens.filter((t) => t.type === 'blank') as Extract<
      Question['tokens'][number],
      { type: 'blank' }
    >[]
  }, [question])

  const items = useMemo(() => buildItems(question), [question])
  const itemById = useMemo(() => Object.fromEntries(items.map((it) => [it.id, it] as const)), [items])

  const initialContainers = useMemo(() => {
    const containers: Containers = {
      [BANK_ID]: items.map((it) => it.id),
    }
    for (const b of blanks) containers[blankContainerId(b.blankId)] = []
    return containers
  }, [items, blanks])

  const [containers, setContainers] = useState<Containers>(initialContainers)
  const [submitted, setSubmitted] = useState(false)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sensors = useSensors(
    // Mobile-first: use TouchSensor with long-press, and avoid PointerSensor on mobile
    // (Pointer-based scrolling can steal the gesture and prevent dragging).
    useSensor(TouchSensor, {
      activationConstraint: { delay: 140, tolerance: 6 },
    }),
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const bankItems = containers[BANK_ID].map((id) => itemById[id]).filter(Boolean)

  function moveItem(active: string, to: string) {
    setContainers((prev) => {
      const from = findContainer(prev, active)
      if (!from) return prev
      if (from === to) return prev

      const nextState: Containers = { ...prev }
      const fromItems = [...nextState[from]]
      const toItems = [...nextState[to]]

      const fromIndex = fromItems.indexOf(active)
      if (fromIndex === -1) return prev

      fromItems.splice(fromIndex, 1)

      const isTargetBlank = to.startsWith('blank:')
      if (isTargetBlank) {
        const existing = toItems[0]
        toItems.length = 0
        toItems.push(active)
        if (existing) fromItems.push(existing)
      } else {
        toItems.push(active)
      }

      nextState[from] = fromItems
      nextState[to] = toItems
      return nextState
    })
  }

  function removeFromBlank(active: string) {
    moveItem(active, BANK_ID)
  }

  function reset() {
    setContainers(initialContainers)
    setSubmitted(false)
    setGrade(null)
    setActiveId(null)
    setSelectedId(null)
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null)

    const active = String(e.active.id)
    const over = e.over?.id ? String(e.over.id) : null

    // If user drops on sentence area but not on a blank, do nothing (snap back).
    if (over === SENTENCE_ID) return

    // If dropped outside sentence area (no droppable), treat as "remove/return to bank".
    if (!over) {
      removeFromBlank(active)
      return
    }

    const to = findContainer(containers, over)
    if (!to) {
      removeFromBlank(active)
      return
    }

    moveItem(active, to)

    // once user changes, clear previous submit result
    if (submitted) {
      setSubmitted(false)
      setGrade(null)
    }
  }

  function submit() {
    const byBlankId: Record<string, boolean> = {}
    let correctCount = 0

    for (const b of blanks) {
      const containerId = blankContainerId(b.blankId)
      const placedId = containers[containerId]?.[0]
      const placedText = placedId ? itemById[placedId]?.text ?? '' : ''
      const ok = normalize(placedText) === normalize(b.answer)
      byBlankId[b.blankId] = ok
      if (ok) correctCount += 1
    }

    const g: Grade = { correctCount, total: blanks.length, byBlankId }
    setGrade(g)
    setSubmitted(true)
  }

  const scoreText = grade ? `${grade.correctCount} / ${grade.total}` : null
  const allBlanksFilled = blanks.every((b) => (containers[blankContainerId(b.blankId)]?.length ?? 0) > 0)

  return (
    <div className="page">
      <header className="topBar">
        <div className="brand">
          <div className="brandMark">EN</div>
          <div>
            <div className="brandTitle">Sentence Completion</div>
            <div className="brandSub">단어 카드를 넣어 문장을 완성해요</div>
          </div>
        </div>
        <div className="meta">
          <div className="pill">{question.level ?? 'Practice'}</div>
          <div className="pill">{idx + 1}/{total}</div>
        </div>
      </header>

      <main className="grid">
        <section className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">{question.title}</div>
              <div className="panelHint">단어 탭 → 빈칸 탭 · 또는 단어를 꾹 눌러 드래그</div>
            </div>
            <div className="score">
              {submitted && scoreText ? (
                <span className={grade?.correctCount === grade?.total ? 'scoreOk' : 'scoreWait'}>
                  Score: {scoreText}
                </span>
              ) : (
                <span className="scoreWait">Not submitted</span>
              )}
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            <div
              ref={setSentenceRef}
              className={['sentence', isOverSentence ? 'isOverSentence' : ''].filter(Boolean).join(' ')}
              aria-label="sentence"
            >
              {question.tokens.map((t, i) => {
                if (t.type === 'text') return <span key={`t-${i}`}>{t.value}</span>

                const containerId = blankContainerId(t.blankId)
                const placedId = containers[containerId]?.[0]
                const placedItem = placedId ? itemById[placedId] : null

                const state = submitted
                  ? grade?.byBlankId[t.blankId]
                    ? 'correct'
                    : 'wrong'
                  : 'neutral'

                return (
                  <span key={t.blankId} className="blankWrap">
                    <DroppableSlot
                      id={containerId}
                      label={`blank ${t.blankId}`}
                      state={state}
                    >
                      {placedItem ? (
                        <WordCard
                          id={placedItem.id}
                          text={placedItem.text}
                          onClick={() => removeFromBlank(placedItem.id)}
                        />
                      ) : (
                        <button
                          type="button"
                          className={['blankTap', selectedId ? 'isReady' : ''].filter(Boolean).join(' ')}
                          onClick={() => {
                            if (!selectedId) return
                            moveItem(selectedId, containerId)
                            setSelectedId(null)
                            if (submitted) {
                              setSubmitted(false)
                              setGrade(null)
                            }
                          }}
                          aria-label="tap to fill blank"
                        >
                          Tap to fill
                        </button>
                      )}
                    </DroppableSlot>
                    {t.hint ? <span className="blankHint">{t.hint}</span> : null}
                  </span>
                )
              })}
            </div>

            <div className="wordBankTitle">Word bank</div>
            <div className="wordBank" aria-label="word bank">
              <div className="bankDropZone">
                <div className="bankDropZoneLabel">Drop here to return</div>
                <DroppableSlot id={BANK_ID} label="word bank drop zone">
                  <span className="slotPlaceholder">Drop words here</span>
                </DroppableSlot>
              </div>
              <div className="bankCards">
                {bankItems.length === 0 ? (
                  <div className="emptyBank">All words placed. (You can drag words back.)</div>
                ) : (
                  bankItems.map((it) => (
                    <WordCard
                      key={it.id}
                      id={it.id}
                      text={it.text}
                      isSelected={selectedId === it.id}
                      onClick={() => setSelectedId((prev) => (prev === it.id ? null : it.id))}
                    />
                  ))
                )}
              </div>
            </div>

            <DragOverlay>
              {activeId && itemById[activeId] ? (
                <div className="wordCard overlay">{itemById[activeId].text}</div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <div className="actions">
            <button className="btn" type="button" onClick={reset}>
              Reset
            </button>
            <button
              className="btn primary"
              type="button"
              onClick={submit}
              disabled={submitted || !allBlanksFilled}
              title={!allBlanksFilled ? 'Fill all blanks first' : undefined}
            >
              Submit & Grade
            </button>
            <button className="btn" type="button" onClick={onNext}>
              Next
            </button>
          </div>

          {submitted ? (
            <div className="feedback" role="status">
              {grade?.correctCount === grade?.total ? (
                <div className="feedbackOk">정답입니다! 잘했어요.</div>
              ) : (
                <div className="feedbackWarn">
                  일부 오답이 있어요. 빈칸 테두리 색으로 정답/오답을 확인해 보세요.
                </div>
              )}
            </div>
          ) : null}
        </section>

        <aside className="side">
          <div className="sidePanel">
            <div className="sideTitle">How it works</div>
            <ul className="sideList">
              <li>단어 카드를 빈칸으로 드래그&드롭</li>
              <li>틀리면 빨간 테두리, 맞으면 초록 테두리</li>
              <li>카드는 다시 Word bank로 되돌릴 수 있어요</li>
            </ul>
          </div>

          <div className="sidePanel">
            <div className="sideTitle">Next ideas (확장)</div>
            <ul className="sideList">
              <li>난이도/주제별 문제 세트</li>
              <li>힌트(뜻/품사/예문) 단계적으로 공개</li>
              <li>정답률/오답노트/스페이싱 리피티션</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="footer">MVP • local-only (no account) • ready to extend to backend later</footer>
    </div>
  )
}

function App() {
  const [idx, setIdx] = useState(0)
  const question = QUESTIONS[idx]

  return (
    <QuestionSession
      key={question.id}
      question={question}
      idx={idx}
      total={QUESTIONS.length}
      onNext={() => setIdx((v) => (v + 1) % QUESTIONS.length)}
    />
  )
}

export default App
