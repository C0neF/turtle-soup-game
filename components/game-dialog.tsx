"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Define the structure for the AI puzzle prop - MUST match page.tsx
interface AiPuzzle {
  description: string
  title?: string
  solution: string // Ensure solution field is present
}

// Define the structure for the AI answer prop
interface AiAnswer {
  text: string;
  isError?: boolean;
}

// Update GameDialogProps to include selectedAnswerModel
interface GameDialogProps {
  isEnglish: boolean
  compact?: boolean
  apiUrl?: string
  apiKey?: string
  // Model selection
  selectedModel?: string
  selectedAnswerModel?: string
  // Use history and index
  puzzleHistory: AiPuzzle[] // Use the updated AiPuzzle interface
  currentPuzzleIndex: number
  // Navigation functions
  goToPreviousPuzzle: () => void
  goToNextPuzzle: () => void
  // Fetch state for NEW puzzles
  isFetchingPuzzle: boolean
  fetchPuzzleError: string | null
  fetchAiPuzzle: () => Promise<void>
  // Question answering props
  aiAnswer: AiAnswer | null
  isFetchingAnswer: boolean
  handleAskQuestion: (question: string) => Promise<void>
  // Add props for question limit
  questionCount: number
  questionLimit: number
  // Add props for settings loading state
  isLoadingModels: boolean
  isSettingsLoaded: boolean
}

export default function GameDialog({
  isEnglish,
  compact = false,
  apiUrl,
  apiKey,
  selectedModel,
  selectedAnswerModel,
  // Destructure new/updated props
  puzzleHistory,
  currentPuzzleIndex,
  goToPreviousPuzzle,
  goToNextPuzzle,
  isFetchingPuzzle,
  fetchPuzzleError,
  fetchAiPuzzle,
  aiAnswer,
  isFetchingAnswer,
  handleAskQuestion,
  // Destructure question limit props
  questionCount,
  questionLimit,
  // Destructure settings loading props
  isLoadingModels,
  isSettingsLoaded,
}: GameDialogProps) {
  const [userQuestion, setUserQuestion] = useState("")
  const [isSolutionVisible, setIsSolutionVisible] = useState(false) // State for solution visibility
  const settingsConfigured = Boolean(apiUrl && apiKey && (selectedModel || '') && (selectedAnswerModel || ''));

  // Get the current puzzle based on the index
  const currentPuzzle = puzzleHistory[currentPuzzleIndex];

  // Reset solution visibility when puzzle index changes
  useEffect(() => {
    setIsSolutionVisible(false);
  }, [currentPuzzleIndex]);

  // Determine if the question limit has been reached
  const limitReached = questionCount >= questionLimit;

  // Determine what to display in the description area
  let puzzleDisplayContent: React.ReactNode
  if (!settingsConfigured) {
    puzzleDisplayContent = (
      <p className="text-sm text-muted-foreground italic">
        {isEnglish
          ? "Click the settings icon (top right) to enter your AI API URL, Key and select both question and answer models, then click \"New Puzzle\"."
          : '点击右上角的设置按钮填写 AI 的 API 地址和密钥(可以点击设置按钮右侧的按钮查看教程获取)，并选择问题模型和回答模型，然后点击"新谜题"。'}
      </p>
    )
  } else if (isFetchingPuzzle && puzzleHistory.length === 0) { // Show loading only when fetching the very first puzzle
     puzzleDisplayContent = (
       <p className="text-sm text-muted-foreground">
         {isEnglish ? "Fetching new puzzle..." : "正在获取新谜题..."}
       </p>
     )
  } else if (fetchPuzzleError && !currentPuzzle) { // Show fetch error only if there's no puzzle to display
    puzzleDisplayContent = (
      <p className="text-sm text-red-600">
        {isEnglish ? "Error fetching puzzle: " : "获取谜题出错："}
        {fetchPuzzleError}
      </p>
    )
  } else if (currentPuzzle) {
    puzzleDisplayContent = <p className="text-sm">{currentPuzzle.description}</p>
  } else {
    puzzleDisplayContent = (
      <p className="text-sm text-muted-foreground">
        {isEnglish ? "Click 'New Puzzle' to start." : '点击"新谜题"开始。'}
      </p>
    )
  }

  // Handler for the Ask Question button
  const onAskQuestionClick = () => {
      if (userQuestion.trim()) {
          handleAskQuestion(userQuestion);
          // Optionally clear the textarea after asking
          // setUserQuestion(""); 
      }
  }

  // Handler for the View Answer button
  const handleViewAnswer = () => {
    setIsSolutionVisible(true);
  }

  // Determine if navigation buttons should be disabled
  const canGoPrev = currentPuzzleIndex > 0;
  const canGoNext = currentPuzzleIndex < puzzleHistory.length - 1;

  // Check if the current puzzle's solution is valid and available
  const isSolutionAvailable = currentPuzzle?.solution && !currentPuzzle.solution.includes("not parsed") && !currentPuzzle.solution.includes("未解析");

  // 检查设置是否已准备好 - 修改逻辑以更安全地处理不同状态
  const settingsReady = settingsConfigured && 
    (isSettingsLoaded || // 设置已加载完成
    !isLoadingModels || // 不在加载模型中
    (selectedModel && selectedAnswerModel)); // 或者已有选中的模型

  return (
    <div className="w-full max-w-3xl h-full flex items-center">
      <Card className="mx-auto w-full">
        <CardHeader className={compact ? "p-4" : "p-6"}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className={compact ? "text-lg" : "text-xl"}>
                {/* Show current puzzle title or default */} 
                {currentPuzzle?.title || (isEnglish ? "AI Puzzle" : "AI 谜题")}
                 {/* Optionally show puzzle number if history exists */}
                 {puzzleHistory.length > 0 && (
                     <span className="text-sm font-normal text-muted-foreground ml-2">
                         ({currentPuzzleIndex + 1} / {puzzleHistory.length})
                     </span>
                 )}
              </CardTitle>
              <CardDescription>
                {/* Show question count / limit */}
                {isEnglish ? `Ask yes/no questions (${questionCount}/${questionLimit} asked)` : `提出是/否问题 (${questionCount}/${questionLimit} 已问)`}
                {limitReached && <span className="text-red-600 font-semibold ml-2">({isEnglish ? "Limit reached!" : "次数已用尽！"})</span>}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className={compact ? "p-4 pt-0" : "p-6"}>
          <div className="space-y-4">
            {/* Puzzle Description Area with Navigation Arrows */}
            <div className="flex items-center justify-center gap-2">
               {/* Left Arrow */}
               <Button
                   variant="ghost"
                   size="icon"
                   onClick={goToPreviousPuzzle}
                   disabled={!canGoPrev || isFetchingPuzzle}
                   className="h-8 w-8 shrink-0" // Smaller button
                   aria-label={isEnglish ? "Previous puzzle" : "上一个谜题"}
               >
                   <ChevronLeft className="h-5 w-5" />
               </Button>

               {/* Puzzle Content Box */}
               <div className="flex-1 p-4 bg-muted rounded-lg min-h-[80px] flex items-center justify-center">
                   {puzzleDisplayContent}
               </div>

               {/* Right Arrow */}
               <Button
                   variant="ghost"
                   size="icon"
                   onClick={goToNextPuzzle}
                   disabled={!canGoNext || isFetchingPuzzle}
                   className="h-8 w-8 shrink-0"
                   aria-label={isEnglish ? "Next puzzle" : "下一个谜题"}
               >
                   <ChevronRight className="h-5 w-5" />
               </Button>
            </div>

            {/* User Interaction Area */}
            <div className="space-y-3">
              <Textarea
                placeholder={isEnglish ? "Type your question here..." : "在这里输入你的问题..."}
                className="min-h-[120px]"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                // Disable if no current puzzle, fetching, or limit reached
                disabled={!currentPuzzle || isFetchingAnswer || isFetchingPuzzle || limitReached}
              />
              <Button
                 className="w-full"
                 // Disable if no current puzzle, fetching, no text, or limit reached
                 disabled={!currentPuzzle || isFetchingPuzzle || isFetchingAnswer || !userQuestion.trim() || limitReached}
                 onClick={onAskQuestionClick}
              >
                 {isFetchingAnswer
                   ? (isEnglish ? "Asking..." : "正在提问...")
                   : (isEnglish ? "Ask Question" : "提问")
                 }
               </Button>
            </div>

            {/* AI Answer Area */}
             {(aiAnswer || isFetchingAnswer) && (
                 <div className={`p-3 rounded-lg ${aiAnswer?.isError ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'}`}>
                     <p className="text-sm font-medium mb-1">
                         {isEnglish ? "AI Answer:" : "AI 回答："}
                     </p>
                     <p className="text-sm">
                         {isFetchingAnswer
                           ? (isEnglish ? "Thinking..." : "思考中...")
                           : aiAnswer?.text
                         }
                     </p>
                 </div>
             )}

            {/* Solution Display Area - Conditionally Rendered */}
            {(isSolutionVisible || limitReached) && isSolutionAvailable && (
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                <p className="text-sm font-medium mb-1">
                  {isEnglish ? "Solution:" : "谜底："}
                  {limitReached && <span className="text-sm font-normal italic ml-1">({isEnglish ? "Auto-revealed" : "自动显示"})</span>}
                </p>
                <p className="text-sm">
                  {currentPuzzle.solution}
                </p>
              </div>
            )}

            {/* Bottom Buttons */}
            <div className="flex justify-between pt-2">
              {/* New Puzzle Button */}
              <Button
                size={compact ? "sm" : "default"}
                variant="outline"
                onClick={fetchAiPuzzle}
                // Disable if fetching or if settings aren't ready yet
                disabled={isFetchingPuzzle || !settingsReady}
              >
                 {/* Show loading state on button */}
                 {isFetchingPuzzle
                   ? (isEnglish ? "Fetching..." : "获取中...")
                   : (isEnglish ? "New Puzzle" : "新谜题")
                 }
              </Button>
              {/* View Answer Button */}
              <Button
                size={compact ? "sm" : "default"}
                variant="outline"
                // Disable if no puzzle, no valid solution, already visible, or limit reached
                disabled={!currentPuzzle || !isSolutionAvailable || isSolutionVisible || limitReached}
                onClick={handleViewAnswer}
              >
                {isEnglish ? "View Solution" : "查看谜底"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
