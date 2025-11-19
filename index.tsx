import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BookOpen, GraduationCap, RefreshCw, CheckCircle2, XCircle, ChevronRight, AlertCircle, HelpCircle } from "lucide-react";

// --- Initialization ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Types ---
type Tab = "learn" | "quiz";

interface QuizItem {
  baseWord: string;
  furigana: string;
  meaning: string; // Korean meaning
  wordType: string; // e.g., "1류 동사", "이형용사"
  targetForm: string; // e.g., "정중형 (마스형)", "과거형"
  correctKanji: string;
  correctKana: string;
  explanation: string;
}

interface QuizState {
  items: QuizItem[];
  currentIndex: number;
  userAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
  score: number;
  loading: boolean;
  completed: boolean;
  error: string | null;
}

// --- Components ---

const Header = ({ currentTab, setTab }: { currentTab: Tab; setTab: (t: Tab) => void }) => (
  <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
    <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 text-teal-700 font-bold text-lg">
        <span className="bg-teal-600 text-white p-1.5 rounded-lg">JP</span>
        <span>일본어 문법 마스터</span>
      </div>
      <nav className="flex gap-1 bg-stone-100 p-1 rounded-lg">
        <button
          onClick={() => setTab("learn")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            currentTab === "learn"
              ? "bg-white text-teal-700 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          학습
        </button>
        <button
          onClick={() => setTab("quiz")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            currentTab === "quiz"
              ? "bg-white text-teal-700 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          퀴즈
        </button>
      </nav>
    </div>
  </header>
);

const GrammarCard = ({ title, rules, examples }: { title: string, rules: string[], examples: {base: string, conj: string, mean: string}[] }) => (
  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-4 shadow-sm">
    <div className="bg-stone-50 px-4 py-3 border-b border-stone-200 font-bold text-stone-700 flex items-center gap-2">
      <BookOpen className="w-4 h-4 text-teal-600" />
      {title}
    </div>
    <div className="p-4">
      <ul className="space-y-2 mb-4 text-sm text-stone-600">
        {rules.map((rule, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-teal-500 mt-1">•</span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
      <div className="bg-teal-50 rounded-lg p-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-teal-800 border-b border-teal-100">
              <th className="pb-2">기본형</th>
              <th className="pb-2">활용형</th>
              <th className="pb-2 text-right">의미</th>
            </tr>
          </thead>
          <tbody className="text-stone-700">
            {examples.map((ex, idx) => (
              <tr key={idx} className="border-b border-teal-100/50 last:border-0">
                <td className="py-2 jp-font font-medium text-base">{ex.base}</td>
                <td className="py-2 jp-font text-teal-700 font-bold text-base">{ex.conj}</td>
                <td className="py-2 text-right text-stone-500 text-xs">{ex.mean}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const LearnSection = () => {
  const [category, setCategory] = useState<"adj" | "verb">("adj");

  return (
    <div className="max-w-3xl mx-auto p-4 animate-fade-in">
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-6 text-sm text-amber-800 flex items-start gap-2">
        <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>한자가 어려운 분들을 위해 모든 예시를 <strong>히라가나</strong>로 표시했습니다.</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setCategory("adj")}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            category === "adj" ? "bg-teal-600 text-white" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          형용사 (Adjectives)
        </button>
        <button
          onClick={() => setCategory("verb")}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            category === "verb" ? "bg-teal-600 text-white" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          동사 (Verbs)
        </button>
      </div>

      {category === "adj" && (
        <div className="space-y-6">
          <GrammarCard
            title="이형용사 (い-Adjectives)"
            rules={[
              "어미가 'い'로 끝나는 형용사입니다.",
              "부정형: 어미 'い'를 떼고 'くない'를 붙입니다.",
              "과거형: 어미 'い'를 떼고 'かった'를 붙입니다.",
              "연결형(Te-form): 어미 'い'를 떼고 'くて'를 붙입니다."
            ]}
            examples={[
              { base: "たかい", conj: "たかくない", mean: "비싸지 않다 (부정)" },
              { base: "あつい", conj: "あつかった", mean: "더웠다 (과거)" },
              { base: "おいしい", conj: "おいしくて", mean: "맛있고/맛있어서 (연결)" },
            ]}
          />
          <GrammarCard
            title="나형용사 (な-Adjectives)"
            rules={[
              "기본형은 어미가 'だ'로 끝납니다.",
              "부정형: 어미 'だ'를 떼고 'じゃない'를 붙입니다.",
              "과거형: 어미 'だ'를 떼고 'だった'를 붙입니다.",
              "명사 수식: 어미 'だ'를 떼고 'な'를 붙여 명사를 수식합니다."
            ]}
            examples={[
              { base: "しんせつだ", conj: "しんせつじゃない", mean: "친절하지 않다 (부정)" },
              { base: "しずかだ", conj: "しずかだった", mean: "조용했다 (과거)" },
              { base: "ゆうめいだ", conj: "ゆうめいな ひと", mean: "유명한 사람 (명사수식)" },
            ]}
          />
        </div>
      )}

      {category === "verb" && (
        <div className="space-y-6">
          <GrammarCard
            title="1류 동사 (U-Verbs)"
            rules={[
              "어미가 'る'로 끝나지 않거나, 'る'로 끝나도 앞 글자가 'あ,う,お'단인 경우입니다.",
              "정중형(Masu): 어미 'u'단을 'i'단으로 바꾸고 'ます'를 붙입니다.",
              "부정형(Nai): 어미 'u'단을 'a'단으로 바꾸고 'ない'를 붙입니다. (우->와)",
              "Te-form: 어미에 따라 다르게 변합니다 (쿠->이테, 무/부/누->은데, 우/츠/루->읏테)."
            ]}
            examples={[
              { base: "かく", conj: "かきます", mean: "씁니다 (정중)" },
              { base: "のむ", conj: "のまない", mean: "마시지 않는다 (부정)" },
              { base: "あう", conj: "あって", mean: "만나고 (Te형)" },
            ]}
          />
          <GrammarCard
            title="2류 동사 (Ru-Verbs)"
            rules={[
              "어미가 'る'로 끝나고, 앞 글자가 'い'단이나 'え'단인 경우입니다.",
              "모든 활용에서 어미 'る'를 떼고 활용어미를 붙입니다.",
              "정중형: 'る' -> 'ます'",
              "부정형: 'る' -> 'ない'",
            ]}
            examples={[
              { base: "たべる", conj: "たべます", mean: "먹습니다 (정중)" },
              { base: "みる", conj: "みない", mean: "보지 않는다 (부정)" },
              { base: "ねる", conj: "ねて", mean: "자고 (Te형)" },
            ]}
          />
           <GrammarCard
            title="3류 동사 (Irregular)"
            rules={[
              "불규칙 동사는 두 개뿐입니다: する (하다), くる (오다).",
              "규칙이 없으므로 외워야 합니다."
            ]}
            examples={[
              { base: "する", conj: "します / しない", mean: "합니다 / 안 한다" },
              { base: "くる", conj: "きます / こない", mean: "옵니다 / 안 온다" },
            ]}
          />
        </div>
      )}
    </div>
  );
};

const QuizSection = () => {
  const [state, setState] = useState<QuizState>({
    items: [],
    currentIndex: 0,
    userAnswer: "",
    showResult: false,
    isCorrect: false,
    score: 0,
    loading: false,
    completed: false,
    error: null,
  });

  const generateQuiz = async () => {
    setState(prev => ({ ...prev, loading: true, completed: false, items: [], currentIndex: 0, score: 0, error: null }));

    try {
      // Define the schema for the response
      const schema: Schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            baseWord: { type: Type.STRING, description: "The base form of the word STRICTLY in Hiragana (NO Kanji). For Na-adjectives, MUST end with 'だ'." },
            furigana: { type: Type.STRING, description: "The reading in Hiragana." },
            meaning: { type: Type.STRING, description: "Korean meaning of the base word." },
            wordType: { type: Type.STRING, description: "Word class (e.g., '1류 동사', '2류 동사', '이형용사', '나형용사')." },
            targetForm: { type: Type.STRING, description: "The target conjugation form (e.g., '정중형 (masu)', '부정형 (nai)', '과거형 (ta)', '테형 (te)')." },
            correctKanji: { type: Type.STRING, description: "The correct conjugated form in Kanji+Kana (or just Kana if commonly written that way)." },
            correctKana: { type: Type.STRING, description: "The correct conjugated form in Hiragana only." },
            explanation: { type: Type.STRING, description: "Brief explanation of the conjugation rule used." },
          },
          required: ["baseWord", "furigana", "meaning", "wordType", "targetForm", "correctKanji", "correctKana", "explanation"],
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
          Generate 5 Japanese conjugation practice questions for a Korean learner.
          Target Audience: Beginners who find Kanji difficult.
          REQUIREMENT: Provide the 'baseWord' in Hiragana ONLY.
          IMPORTANT: For Na-adjectives, the baseWord MUST end with 'だ' (e.g., しずかだ, きれいだ).
          IMPORTANT: Use the terms '1류 동사', '2류 동사', '3류 동사' for verb types instead of groups.
          Focus on JLPT N5/N4 level vocabulary.
          Mix Verbs (1류, 2류, 3류) and Adjectives (i-adj, na-adj).
          Mix target forms: Polite (Masu/Desu), Plain Negative (Nai), Past (Ta/Datta), Te-form.
          Ensure the "targetForm" description is clear in Korean.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      const text = response.text;
      if (text) {
        const data = JSON.parse(text) as QuizItem[];
        setState(prev => ({ ...prev, items: data, loading: false }));
      } else {
        throw new Error("No data returned");
      }

    } catch (error) {
      console.error("Quiz Generation Error:", error);
      setState(prev => ({ ...prev, loading: false, error: "퀴즈를 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }));
    }
  };

  const checkAnswer = () => {
    const currentItem = state.items[state.currentIndex];
    const input = state.userAnswer.trim();
    
    // Simple check: Matches Kanji or Kana answer exactly (case insensitive just in case)
    // For more robust checking we could use WanaKana or similar to normalize, but exact match is good for drills.
    const isCorrect = input === currentItem.correctKanji || input === currentItem.correctKana;

    setState(prev => ({
      ...prev,
      showResult: true,
      isCorrect,
      score: isCorrect ? prev.score + 1 : prev.score
    }));
  };

  const nextQuestion = () => {
    if (state.currentIndex >= state.items.length - 1) {
      setState(prev => ({ ...prev, completed: true, showResult: false }));
    } else {
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        userAnswer: "",
        showResult: false,
        isCorrect: false
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (state.showResult) {
        if (!state.completed) nextQuestion();
      } else {
        checkAnswer();
      }
    }
  };

  // Initial load
  useEffect(() => {
    if (state.items.length === 0 && !state.loading && !state.completed && !state.error) {
       // Optionally auto-start or wait for user. Let's wait for user to click "Start".
    }
  }, []);

  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <p className="text-stone-500 font-medium animate-pulse">히라가나 전용 퀴즈 생성 중...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 rounded-xl border border-red-100 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 mb-4">{state.error}</p>
        <button onClick={generateQuiz} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">다시 시도</button>
      </div>
    );
  }

  if (state.completed) {
    return (
      <div className="max-w-md mx-auto mt-8 p-8 bg-white rounded-2xl shadow-sm border border-stone-100 text-center animate-fade-in">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">퀴즈 완료!</h2>
        <p className="text-stone-500 mb-6">오늘의 학습 성과입니다.</p>
        
        <div className="text-5xl font-bold text-teal-600 mb-8">
            {state.score} <span className="text-2xl text-stone-400">/ {state.items.length}</span>
        </div>

        <button 
            onClick={generateQuiz} 
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
        >
            <RefreshCw className="w-5 h-5" />
            새로운 퀴즈 풀기
        </button>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-8 p-8 bg-white rounded-2xl shadow-sm border border-stone-100 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-stone-800 mb-2">일본어 활용 연습</h2>
        <p className="text-stone-500 mb-6 text-sm">
          AI가 동사와 형용사의 다양한 활용형 문제를 <br/>
          <span className="font-bold text-indigo-600">히라가나</span>로 생성합니다.
        </p>
        <button 
            onClick={generateQuiz} 
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
        >
            퀴즈 시작하기
        </button>
      </div>
    );
  }

  const currentItem = state.items[state.currentIndex];

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center text-sm text-stone-400">
        <span>문제 {state.currentIndex + 1} / {state.items.length}</span>
        <span>점수: {state.score}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
        {/* Question Card Header */}
        <div className="bg-stone-50 p-6 text-center border-b border-stone-100">
           <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold mb-3">
            {currentItem.wordType}
           </span>
           {/* Display Base Word (Expected to be Hiragana from AI) */}
           <h2 className="text-4xl font-bold text-stone-800 mb-2 jp-font">{currentItem.baseWord}</h2>
           
           {/* Only show furigana if it's different from baseWord (rare if we ask for hiragana base) */}
           <p className="text-stone-500 text-sm">
             {currentItem.furigana && currentItem.furigana !== currentItem.baseWord ? `${currentItem.furigana} • ` : ""}
             {currentItem.meaning}
           </p>
        </div>

        {/* Task */}
        <div className="p-6">
            <div className="mb-6 text-center">
                <p className="text-stone-400 text-sm mb-1">다음 형태로 바꾸세요</p>
                <p className="text-xl font-bold text-indigo-600">{currentItem.targetForm}</p>
            </div>

            {/* Input Area */}
            <div className="relative mb-4">
                <input
                    type="text"
                    value={state.userAnswer}
                    onChange={(e) => setState(prev => ({ ...prev, userAnswer: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    placeholder="히라가나로 입력하세요"
                    className={`w-full p-4 text-lg text-center border-2 rounded-xl outline-none transition-all jp-font ${
                        state.showResult 
                            ? state.isCorrect 
                                ? "border-green-500 bg-green-50 text-green-800" 
                                : "border-red-300 bg-red-50 text-red-800"
                            : "border-stone-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    }`}
                    disabled={state.showResult}
                    autoFocus
                />
            </div>

            {/* Feedback Area */}
            {state.showResult && (
                <div className={`p-4 rounded-xl mb-6 animate-fade-in ${state.isCorrect ? "bg-green-50" : "bg-red-50"}`}>
                    <div className="flex items-center gap-2 mb-2">
                        {state.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`font-bold ${state.isCorrect ? "text-green-700" : "text-red-700"}`}>
                            {state.isCorrect ? "정답입니다!" : "오답입니다."}
                        </span>
                    </div>
                    
                    {!state.isCorrect && (
                        <div className="mb-3">
                            <p className="text-xs text-stone-500 mb-1">정답:</p>
                            <p className="text-lg font-bold text-stone-800 jp-font">
                                {/* Show Hiragana Correct Answer First */}
                                {currentItem.correctKana} 
                                {/* Show Kanji only if different */}
                                {currentItem.correctKanji !== currentItem.correctKana && (
                                    <span className="text-stone-400 font-normal text-base ml-2">({currentItem.correctKanji})</span>
                                )}
                            </p>
                        </div>
                    )}
                    
                    <div className="text-sm text-stone-600 border-t border-stone-200/50 pt-2 mt-2">
                        <div className="flex gap-2">
                            <HelpCircle className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                            <p>{currentItem.explanation}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Button */}
            <button
                onClick={state.showResult ? nextQuestion : checkAnswer}
                className={`w-full py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    state.showResult
                        ? "bg-stone-800 text-white hover:bg-stone-900"
                        : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200"
                }`}
            >
                {state.showResult ? (
                    <>다음 문제 <ChevronRight className="w-5 h-5" /></>
                ) : (
                    "정답 확인"
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [currentTab, setTab] = useState<Tab>("learn");

  return (
    <div className="min-h-screen bg-stone-50 pb-10">
      <Header currentTab={currentTab} setTab={setTab} />
      
      <main className="mt-4">
        {currentTab === "learn" ? <LearnSection /> : <QuizSection />}
      </main>
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}