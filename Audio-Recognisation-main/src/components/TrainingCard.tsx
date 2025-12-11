import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, CheckCircle, User } from 'lucide-react';

interface TrainingCardProps {
  trainingClips: Blob[];
  setTrainingClips: (clips: Blob[]) => void;
}

const COLORS = {
  primary: 'indigo',
  danger: 'rose',
  success: 'emerald',
  warning: 'amber',
  gray: 'slate',
};

export default function TrainingCard({ trainingClips, setTrainingClips }: TrainingCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [username, setUsername] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef(0);

  const REQUIRED_CLIPS = 4;
  const MIN_DURATION = 5;
  const MAX_DURATION = 10;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const enrollClip = async (clipBlob: Blob, clipNum: number) => {
    setUploadStatus('uploading');
    setUploadMessage(`Uploading Clip ${clipNum}...`);

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('clip_number', clipNum.toString());
      formData.append('audio', clipBlob, `clip_${clipNum}.webm`);

      const response = await fetch('http://localhost:5000/enroll', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        setUploadMessage(`Clip ${clipNum} Enrolled! ✅`);
        return true;
      } else {
        setUploadStatus('error');
        setUploadMessage(`Error: ${data.message || 'Upload failed'}`);
        return false;
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(`Network Error: ${error instanceof Error ? error.message : 'Unknown object'}`);
      return false;
    }
  };

  const startRecording = async () => {
    if (!username.trim()) {
      alert("Please enter a username first!");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordingTime(0);
      recordingTimeRef.current = 0;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        if (recordingTimeRef.current >= MIN_DURATION) {
          // Calculate clip number (1-based)
          const clipNumber = trainingClips.length + 1;

          // Upload immediately
          const success = await enrollClip(blob, clipNumber);

          if (success) {
            const newClips = [...trainingClips, blob];
            setTrainingClips(newClips);
          }
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

  const clearAllClips = () => {
    setTrainingClips([]);
    setUploadStatus('idle');
    setUploadMessage('');
    // Optionally call backend to delete user? 
    // For now we just reset local state to allow re-recording.
  };

  const isTrainingComplete = trainingClips.length >= REQUIRED_CLIPS;
  const nextClipNumber = trainingClips.length + 1;
  const isRecordingOverMin = recordingTime >= MIN_DURATION;

  return (
    <div className={`bg-${COLORS.gray}-800 rounded-2xl shadow-xl p-8 border border-${COLORS.gray}-700/70`}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">🧠 Train Voice Model</h2>
        <div className={`text-lg font-bold ${isTrainingComplete ? `text-${COLORS.success}-400` : 'text-white'}`}>
          {isTrainingComplete ? 'Complete' : `${trainingClips.length}/${REQUIRED_CLIPS}`}
        </div>
      </div>

      {/* Username Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">User Identity</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter unique username (e.g. 'john_doe')"
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-500"
            disabled={trainingClips.length > 0}
          />
          {trainingClips.length > 0 && (
            <p className="mt-2 text-xs text-indigo-400">Username locked during recording session.</p>
          )}
        </div>
      </div>

      {/* Recording Area */}
      <div className="mb-8">
        <div className={`bg-${COLORS.gray}-900 rounded-xl p-8 border-2 border-dashed ${isRecording ? `border-${COLORS.danger}-600/50` : `border-${COLORS.gray}-700`}`}>
          <div className="text-center">
            {isRecording ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className={`w-28 h-28 bg-${COLORS.danger}-600 rounded-full flex items-center justify-center animate-ping-slow opacity-20 absolute inset-0`}></div>
                    <div className={`w-24 h-24 bg-${COLORS.danger}-600 rounded-full flex items-center justify-center relative shadow-2xl`}>
                      <Mic className="w-12 h-12 text-white animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className={`text-6xl font-extrabold text-${COLORS.gray}-100`}>
                  {recordingTime.toFixed(1)}<span className="text-3xl font-semibold">s</span>
                </div>
                <p className={`text-sm font-medium ${isRecordingOverMin ? `text-${COLORS.success}-400` : `text-${COLORS.warning}-400`} max-w-sm mx-auto`}>
                  {isRecordingOverMin
                    ? 'Recording is sufficient. Press stop to upload.'
                    : `Keep talking. Minimum duration: ${MIN_DURATION.toFixed(0)}s`}
                </p>
                <button
                  onClick={stopRecording}
                  className={`px-8 py-4 bg-${COLORS.danger}-600 hover:bg-${COLORS.danger}-700 text-white rounded-full font-semibold text-lg transition-all shadow-md hover:shadow-lg flex items-center gap-3 mx-auto mt-4`}
                >
                  <Square className="w-5 h-5" />
                  Stop & Upload
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status Message Display Area */}
                {uploadMessage && (
                  <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${uploadStatus === 'error' ? 'bg-red-900/50 text-red-200' :
                    uploadStatus === 'success' ? 'bg-emerald-900/50 text-emerald-200' :
                      'bg-blue-900/50 text-blue-200'
                    }`}>
                    {uploadMessage}
                  </div>
                )}

                <div className={`w-24 h-24 bg-${COLORS.primary}-600 rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                  <Mic className="w-12 h-12 text-white" />
                </div>
                <div className="text-xl font-bold text-white">
                  {isTrainingComplete
                    ? `Training Complete (${REQUIRED_CLIPS} clips)`
                    : `Record Clip ${nextClipNumber} of ${REQUIRED_CLIPS}`
                  }
                </div>
                <p className={`text-base text-${COLORS.gray}-300 max-w-sm mx-auto`}>
                  Record **{MIN_DURATION}-{MAX_DURATION} seconds** of clear audio.
                </p>
                <button
                  onClick={startRecording}
                  disabled={isTrainingComplete}
                  className={`px-8 py-4 bg-${COLORS.primary}-600 hover:bg-${COLORS.primary}-700 ${isTrainingComplete ? 'bg-opacity-50 cursor-not-allowed' : ''} text-white rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto`}
                >
                  <Mic className="w-6 h-6" />
                  {isTrainingComplete ? 'Max Clips Reached' : 'Start Recording'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recorded Clips List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700 pb-2">
          <h3 className={`text-sm font-bold text-${COLORS.gray}-300 uppercase tracking-wider`}>
            {trainingClips.length} Clips Enrolled
          </h3>
          {trainingClips.length > 0 && (
            <button
              onClick={clearAllClips}
              className={`text-sm text-${COLORS.danger}-400 hover:text-${COLORS.danger}-300 font-medium transition-colors flex items-center gap-1`}
            >
              <Trash2 className="w-4 h-4" /> Reset Process
            </button>
          )}
        </div>

        {trainingClips.length === 0 ? (
          <div className={`text-center py-8 text-${COLORS.gray}-500 text-sm italic`}>
            Enter username and record clips to train.
          </div>
        ) : (
          <div className="space-y-3">
            {trainingClips.map((clip, index) => (
              <div
                key={index}
                className={`flex items-center justify-between bg-${COLORS.gray}-900 rounded-xl p-4 border border-${COLORS.success}-700/50`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-600">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-slate-100">
                    Clip {index + 1}
                  </span>
                  <span className={`text-sm text-${COLORS.gray}-400`}>
                    ({(clip.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}