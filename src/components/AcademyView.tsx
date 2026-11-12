import React, { useState } from 'react';
import { AcademyLesson } from '../types/forex';
import { ACADEMY_LESSONS } from '../services/mockData';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Loader2,
  Clock,
  Award,
} from 'lucide-react';

export const AcademyView: React.FC = () => {
  const [lessons] = useState<AcademyLesson[]>(ACADEMY_LESSONS);
  const [selectedLesson, setSelectedLesson] = useState<AcademyLesson>(ACADEMY_LESSONS[0]);

  // Quiz state: lessonId -> questionIndex -> selectedOptionIndex
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // AI Tutor drawer
  const [tutorQuery, setTutorQuery] = useState<string>('');
  const [tutorAnswer, setTutorAnswer] = useState<string | null>(null);
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    setQuizAnswers({
      ...quizAnswers,
      [`${selectedLesson.id}-${qIdx}`]: optIdx,
    });
  };

  const handleAskTutor = async () => {
    if (!tutorQuery.trim() || isTutorLoading) return;
    setIsTutorLoading(true);
    setTutorAnswer(null);

    try {
      const response = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedLesson.title,
          question: tutorQuery,
        }),
      });

      const data = await response.json();
      setTutorAnswer(data.answer || 'No response returned.');
    } catch (err) {
      console.error(err);
      setTutorAnswer('Error connecting to AI Tutor.');
    } finally {
      setIsTutorLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            ForexAI Academy & Masterclass
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Mathematical Foundations & Trading Psychology</span>
            <span>·</span>
            <span>Interactive Quizzes</span>
            <span>·</span>
            <span className="text-slate-400">Institutional Curriculum</span>
          </div>
        </div>

        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-lg flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          <span>Self-Paced Certification Track</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Syllabus List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Core Curriculum Modules
          </h3>

          <div className="space-y-2">
            {lessons.map((lesson, idx) => {
              const isSelected = lesson.id === selectedLesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setQuizSubmitted(false);
                  }}
                  className={`w-full p-3.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 dark:border-blue-500 shadow-xs'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      Module {idx + 1}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {lesson.durationMinutes} min
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    {lesson.title}
                  </h4>

                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {lesson.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* AI Concept Tutor Card */}
          <div className="p-4 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 mt-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Ask the ForexAI Tutor</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Have a question about lot sizing, pip value math, or market terminology?
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={tutorQuery}
                onChange={(e) => setTutorQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskTutor();
                }}
                placeholder="e.g. Why is EUR/USD pip value $10 for 1 lot?"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400"
              />

              <button
                onClick={handleAskTutor}
                disabled={isTutorLoading || !tutorQuery.trim()}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                {isTutorLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                <span>Ask AI Tutor</span>
              </button>
            </div>

            {tutorAnswer && (
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans max-h-48 overflow-y-auto">
                <div className="whitespace-pre-line">{tutorAnswer}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Lesson Content & Quizzes (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Lesson Body */}
          <div className="p-6 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  {selectedLesson.category.replace('_', ' ')}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedLesson.title}
                </h2>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {selectedLesson.difficulty}
              </span>
            </div>

            <div className="prose prose-invert prose-xs max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-xs space-y-3 font-sans whitespace-pre-line">
              {selectedLesson.contentMarkdown}
            </div>

            {/* Interactive Module Quiz */}
            {selectedLesson.quiz && selectedLesson.quiz.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <span>Module Knowledge Check</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedLesson.quiz.length} Question{selectedLesson.quiz.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-4">
                  {selectedLesson.quiz.map((q, qIdx) => {
                    const answeredOpt = quizAnswers[`${selectedLesson.id}-${qIdx}`];
                    const isAnswered = answeredOpt !== undefined;
                    const isCorrect = isAnswered && answeredOpt === q.correctIndex;

                    return (
                      <div
                        key={qIdx}
                        className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                      >
                        <div className="font-semibold text-xs text-slate-900 dark:text-white">
                          {qIdx + 1}. {q.question}
                        </div>

                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => {
                            const isSelectedOpt = answeredOpt === optIdx;
                            let btnStyle =
                              'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500';

                            if (quizSubmitted) {
                              if (optIdx === q.correctIndex) {
                                btnStyle =
                                  'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold';
                              } else if (isSelectedOpt) {
                                btnStyle =
                                  'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-300';
                              }
                            } else if (isSelectedOpt) {
                              btnStyle =
                                'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold';
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                className={`w-full p-2.5 rounded-lg border text-xs text-left transition-colors flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && optIdx === q.correctIndex && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="p-2.5 rounded bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Submit Quiz Answers
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
