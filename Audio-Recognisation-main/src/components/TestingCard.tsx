import { useState, useRef, useEffect } from 'react';
import { Mic, Square, PlayCircle, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface TestingCardProps {
  trainingClips: Blob[];
}

interface TopMatch {
  username: string;
  similarity: number;
}

interface PredictionResponse {
  status: string;
  prediction: string;
  confidence: number;
  threshold: number;
  top_matches?: TopMatch[];
  all_similarities?: Record<string, number>;
  message: string;
}

const COLORS = {
  primary: 'indigo',
  success: 'emerald',
  failure: 'rose',
  warning: 'amber',
  gray: 'slate',
};

export default function TestingCard({ trainingClips }: TestingCardProps) {
  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [testClip, setTestClip] = useState<Blob | null>(null);
  const [recognitionResult, setRecognitionResult] = useState<'match' | 'no-match' | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef(0);

  const MIN_DURATION = 3;
  const MAX_DURATION = 10;
  const isTrainingComplete = trainingClips.length >= 4;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const performRecognition = async (clip: Blob) => {
    setRecognitionResult(null);
    setPredictionData(null);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('audio', clip, 'test_clip.webm');

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      const data: PredictionResponse = await response.json();

      if (response.ok) {
        setPredictionData(data);
        if (data.prediction !== 'Unknown') {
          setRecognitionResult('match');
        } else {
          setRecognitionResult('no-match');
        }
      } else {
        setErrorMsg(data.message || 'Prediction failed');
        setRecognitionResult(null);
      }

    } catch (error) {
      setErrorMsg(`Network Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      setRecognitionResult(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecognitionResult(null);
      setRecordingTime(0);
      recordingTimeRef.current = 0;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        if (recordingTimeRef.current >= MIN_DURATION) {
          setTestClip(blob);
          performRecognition(blob);
        } else {
          setTestClip(null);
          setRecognitionResult(null);
        }

        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
        recordingTimeRef.current = 0;
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 0.1;
          recordingTimeRef.current = newTime;
          if (newTime >= MAX_DURATION) {
            stopRecording();
          }
          return newTime;
        });
      }, 100);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playTestClip = () => {
    if (testClip) {
      const audio = new Audio(URL.createObjectURL(testClip));
      audio.play();
    }
  };

  // Derive top matches (top 5) from either explicit `top_matches` or
  // from `all_similarities` if the server returns only that mapping.
  const topMatches = (() => {
    if (!predictionData) return [] as TopMatch[];
    if (predictionData.top_matches && predictionData.top_matches.length > 0) {
      return predictionData.top_matches.slice(0, 5);
    }
    if (predictionData.all_similarities) {
      const entries = Object.entries(predictionData.all_similarities)
        .map(([username, similarity]) => ({ username, similarity }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);
      return entries as TopMatch[];
    }
    return [] as TopMatch[];
  })();

  const getTimerColor = () => {
    if (recordingTime < MIN_DURATION) return `text-${COLORS.warning}-400`;
    return `text-${COLORS.primary}-400`;
  };

  const getTimerMessage = () => {
    if (recordingTime < MIN_DURATION) {
      return `Recording... Speak clearly (min ${MIN_DURATION.toFixed(0)}s)`;
    }
    return `Test sample recorded (${recordingTime.toFixed(1)}s). Stop when finished.`;
  };

  return (
    <div className={`bg-${COLORS.gray}-800 rounded-2xl shadow-xl p-8 border border-${COLORS.gray}-700/70`}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">🎙️ Recognition Test</h2>
      </div>

      {!isTrainingComplete ? (
        <div className={`flex flex-col items-center justify-center py-16 px-4 bg-${COLORS.gray}-900 rounded-xl border-2 border-dashed border-${COLORS.warning}-600/50`}>
          <AlertCircle className={`w-14 h-14 text-${COLORS.warning}-500 mb-4`} />
          <h3 className="text-xl font-bold text-white mb-2">
            Model Not Trained
          </h3>
          <p className={`text-${COLORS.gray}-400 text-center max-w-sm`}>
            A minimum of 4 training clips is required before the system can analyze new speaker samples.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className={`bg-${COLORS.gray}-900 rounded-xl p-8 border-2 border-dashed border-${COLORS.gray}-700`}>
              <div className="text-center">
                {isRecording ? (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className={`w-28 h-28 bg-${COLORS.primary}-600 rounded-full flex items-center justify-center animate-ping-slow opacity-20 absolute inset-0`}></div>
                        <div className={`w-24 h-24 bg-${COLORS.primary}-600 rounded-full flex items-center justify-center relative shadow-2xl`}>
                          <Mic className="w-12 h-12 text-white animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className={`text-6xl font-extrabold ${getTimerColor()}`}>
                      {recordingTime.toFixed(1)}<span className="text-3xl font-semibold">s</span>
                    </div>
                    <p className={`text-sm font-medium text-${COLORS.gray}-400 max-w-sm mx-auto`}>
                      {getTimerMessage()}
                    </p>
                    <button
                      onClick={stopRecording}
                      className={`px-8 py-4 bg-${COLORS.primary}-600 hover:bg-${COLORS.primary}-700 text-white rounded-full font-semibold text-lg transition-all shadow-md hover:shadow-lg flex items-center gap-3 mx-auto mt-4`}
                    >
                      <Square className="w-5 h-5" />
                      Stop & Analyze
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className={`w-24 h-24 bg-${COLORS.primary}-600 rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                      <Mic className="w-12 h-12 text-white" />
                    </div>
                    <p className={`text-base text-${COLORS.gray}-300 max-w-sm mx-auto`}>
                      Click below to record a sample and test for a speaker match.
                    </p>
                    <button
                      onClick={startRecording}
                      className={`px-8 py-4 bg-${COLORS.primary}-600 hover:bg-${COLORS.primary}-700 text-white rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto`}
                    >
                      <Mic className="w-6 h-6" />
                      Record Test Sample
                    </button>
                    {errorMsg && (
                      <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm">
                        {errorMsg}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {testClip && !isRecording && (
            <div className="space-y-6">
              <div className={`bg-${COLORS.gray}-900 rounded-xl p-5 border border-${COLORS.gray}-700`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">Test Sample Ready</p>
                    <p className={`text-sm text-${COLORS.gray}-400 mt-1`}>
                      Size: {(testClip.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={playTestClip}
                    className={`p-4 bg-${COLORS.primary}-600 hover:bg-${COLORS.primary}-700 text-white rounded-full transition-colors shadow-md`}
                    title="Play Test Clip"
                  >
                    <PlayCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Recognition Result */}
              {recognitionResult === null && !errorMsg ? (
                <div className={`bg-${COLORS.primary}-900/50 border border-${COLORS.primary}-700 rounded-xl p-6`}>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <p className={`text-xl font-bold text-${COLORS.primary}-200`}>
                      Analyzing Voice Sample...
                    </p>
                  </div>
                </div>
              ) : recognitionResult === 'match' ? (
                <div className={`bg-${COLORS.success}-900/50 border border-${COLORS.success}-700 rounded-xl p-6`}>
                  <div className="text-center">
                    <CheckCircle className={`w-16 h-16 text-${COLORS.success}-500 mx-auto mb-4`} />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {predictionData?.prediction} Recognized! ✅
                    </h3>
                    <p className={`text-${COLORS.success}-300`}>
                      Confidence: {((predictionData?.confidence || 0) * 100).toFixed(1)}%
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Voice matched with trained profile.
                    </p>
                  </div>

                  {/* Top Matches Table */}
                  {topMatches && topMatches.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-emerald-700/50">
                      <h4 className="text-sm font-semibold text-emerald-300 mb-4 text-center">
                        Similarity Scores (Top {topMatches.length})
                      </h4>
                      <div className="space-y-3">
                        {topMatches.map((match, idx) => {
                          const isTopMatch = idx === 0;
                          const aboveThreshold = match.similarity >= (predictionData?.threshold || 0.75);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-center text-sm">
                                <span className={`font-medium ${isTopMatch ? 'text-emerald-300' : 'text-gray-300'}`}>
                                  {idx + 1}. {match.username}
                                  {isTopMatch && ' 👑'}
                                </span>
                                <span className={`font-mono ${isTopMatch ? 'text-emerald-300' : 'text-gray-400'}`}>
                                  {(match.similarity * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-2 rounded-full transition-all ${
                                    isTopMatch 
                                      ? 'bg-emerald-500' 
                                      : aboveThreshold 
                                        ? 'bg-emerald-700' 
                                        : 'bg-gray-600'
                                  }`}
                                  style={{ width: `${match.similarity * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 text-center text-xs text-gray-500">
                        Threshold: {((predictionData?.threshold || 0.75) * 100).toFixed(0)}% 
                        <span className="ml-2">• Bars above threshold are highlighted</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : recognitionResult === 'no-match' ? (
                <div className={`bg-${COLORS.failure}-900/50 border border-${COLORS.failure}-700 rounded-xl p-6`}>
                  <div className="text-center">
                    <XCircle className={`w-16 h-16 text-${COLORS.failure}-500 mx-auto mb-4`} />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Speaker Not Recognized ❌
                    </h3>
                    <p className={`text-${COLORS.failure}-300`}>
                      No voice match found above threshold ({((predictionData?.threshold || 0.75) * 100).toFixed(0)}%).
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Closest match: {((predictionData?.confidence || 0) * 100).toFixed(1)}%
                    </p>
                  </div>

                  {/* Top Matches Table for No-Match */}
                  {topMatches && topMatches.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-rose-700/50">
                      <h4 className="text-sm font-semibold text-rose-300 mb-4 text-center">
                        Closest Matches (All Below Threshold)
                      </h4>
                      <div className="space-y-3">
                        {topMatches.map((match, idx) => {
                          const isClosest = idx === 0;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-center text-sm">
                                <span className={`font-medium ${isClosest ? 'text-rose-300' : 'text-gray-400'}`}>
                                  {idx + 1}. {match.username}
                                </span>
                                <span className={`font-mono ${isClosest ? 'text-rose-300' : 'text-gray-500'}`}>
                                  {(match.similarity * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-2 rounded-full transition-all ${
                                    isClosest ? 'bg-rose-600' : 'bg-gray-600'
                                  }`}
                                  style={{ width: `${match.similarity * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 text-center text-xs text-gray-500">
                        Threshold: {((predictionData?.threshold || 0.75) * 100).toFixed(0)}% 
                        <span className="ml-2">• None reached minimum confidence</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}