import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import ApiKeyModal from './components/ApiKeyModal';
import { generateLessonPlan } from './services/geminiService';
import { LessonInput, LessonPlanResponse, LoadingState } from './types';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<LessonPlanResponse | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    const storedModel = localStorage.getItem('gemini_model');
    if (storedKey) setApiKey(storedKey);
    if (storedModel) setSelectedModel(storedModel);

    if (!storedKey) {
      setIsSettingsOpen(true);
    }
  }, []);

  const handleSaveSettings = (key: string, model: string) => {
    setApiKey(key);
    setSelectedModel(model);
    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('gemini_model', model);
  };

  const handleSubmit = async (data: LessonInput) => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setLoadingState(LoadingState.LOADING);
    setErrorMessage(null);
    try {
      const generatedPlan = await generateLessonPlan(data, apiKey, selectedModel);
      setResult(generatedPlan);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
      setErrorMessage(error.message || "Vui lòng kiểm tra file và thử lại.");
    }
  };

  const handleReset = () => {
    setResult(null);
    setLoadingState(LoadingState.IDLE);
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-card-dark/90 backdrop-blur-md border-b border-[#ccfbf1] dark:border-teal-900 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center p-2 rounded-full hover:bg-teal-50 dark:hover:bg-teal-700 transition-colors" onClick={handleReset}>
            <span className="material-symbols-outlined text-[#111418] dark:text-white">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-teal-900 dark:text-white">KẾ HOẠCH BÀI GIẢNG PRO</h1>
            <p className="text-sm font-medium text-teal-900 dark:text-teal-50">Nâng cấp bài giảng tự động - phát triển bởi thầy Trần Hoài Thanh</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-xs text-teal-600 dark:text-teal-200 font-medium mr-2">
            AI Assistant
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-bold border border-slate-300"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            {!apiKey && <span className="text-red-500 hidden sm:inline">Lấy API key để sử dụng app</span>}
          </button>

          <button className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">check</span>
            <span>Phiên bản Pro</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-6 lg:p-8">

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 animate-fadeIn">
            <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
            <div>
              <h4 className="font-bold">Đã xảy ra lỗi</h4>
              <p className="text-sm mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {!result ? (
          <InputForm onSubmit={handleSubmit} loadingState={loadingState} />
        ) : (
          <ResultDisplay data={result} onReset={handleReset} />
        )}
      </main>

      {/* Footer Promotion */}
      <footer className="bg-slate-800 text-slate-300 py-8 px-4 mt-auto border-t border-slate-700 no-print">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
            <p className="font-bold text-lg md:text-xl text-blue-200 mb-3 leading-relaxed">
              ĐĂNG KÝ KHOÁ HỌC THỰC CHIẾN VIẾT SKKN, TẠO APP DẠY HỌC, TẠO MÔ PHỎNG TRỰC QUAN <br className="hidden md:block" />
              <span className="text-yellow-400">CHỈ VỚI 1 CÂU LỆNH</span>
            </p>
            <a
              href="https://tinyurl.com/khoahocAI2025"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-900/50"
            >
              ĐĂNG KÝ NGAY
            </a>
          </div>

          <div className="space-y-2 text-sm md:text-base">
            <p className="font-medium text-slate-400">Mọi thông tin vui lòng liên hệ:</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
              <a
                href="https://www.facebook.com/tranhoaithanhvicko/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
              >
                <span className="font-bold">Facebook:</span> tranhoaithanhvicko
              </a>
              <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-600"></div>
              <span className="hover:text-emerald-400 transition-colors duration-200 cursor-default flex items-center gap-2">
                <span className="font-bold">Zalo:</span> 0348296773
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Loading Overlay */}
      {loadingState === LoadingState.LOADING && (
        <div className="fixed inset-0 bg-white/90 dark:bg-black/80 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-primary rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-bold text-teal-900 dark:text-white mb-2">Đang phân tích & thiết kế...</h3>
          <p className="text-teal-600 dark:text-teal-300 mb-1">AI đang xây dựng các hoạt động tích cực cho lớp học của bạn</p>
          <p className="text-teal-500 text-sm animate-pulse">(Quá trình tạo MÔ PHỎNG & GIÁO ÁN có thể mất từ 30-60 giây)</p>
        </div>
      )}

      {/* Settings Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialApiKey={apiKey}
        initialModel={selectedModel}
      />
    </div>
  );
};

export default App;
