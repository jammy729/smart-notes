
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Play, Pause, Save, Trash2 } from "lucide-react";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState("");
  const intervalRef = useRef<NodeJS.Timeout>();

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    // Simulate real-time transcription
    setTimeout(() => {
      setTranscription("Doctor: Good morning, how are you feeling today?\nPatient: I've been having some chest pain...");
    }, 2000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const pauseRecording = () => {
    setIsPaused(!isPaused);
    if (isPaused && intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    stopRecording();
    setRecordingTime(0);
    setTranscription("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Audio Recording
              </CardTitle>
              <CardDescription>Record your consultation session</CardDescription>
            </div>
            <Badge variant={isRecording ? "default" : "secondary"}>
              {isRecording ? (isPaused ? "Paused" : "Recording") : "Ready"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recording Controls */}
          <div className="flex flex-col items-center space-y-4">
            <div className="text-4xl font-mono text-blue-600">
              {formatTime(recordingTime)}
            </div>
            
            <div className="flex items-center space-x-4">
              {!isRecording ? (
                <Button 
                  onClick={startRecording}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={pauseRecording}
                    variant="outline"
                    size="lg"
                  >
                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </Button>
                  <Button 
                    onClick={stopRecording}
                    size="lg"
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop
                  </Button>
                </>
              )}
              
              {recordingTime > 0 && (
                <>
                  <Button onClick={resetRecording} variant="outline" size="lg">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="lg">
                    <Save className="w-5 h-5 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Recording Visualization */}
          {isRecording && !isPaused && (
            <div className="flex justify-center">
              <div className="flex items-center space-x-1">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-red-500 rounded animate-pulse"
                    style={{ 
                      height: Math.random() * 40 + 10,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Transcription */}
      {transcription && (
        <Card>
          <CardHeader>
            <CardTitle>Live Transcription</CardTitle>
            <CardDescription>Real-time conversation transcript</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] font-mono text-sm whitespace-pre-line">
              {transcription}
              {isRecording && !isPaused && (
                <span className="animate-pulse">_</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AudioRecorder;
