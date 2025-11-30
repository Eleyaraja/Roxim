# Timer Component - Complete! ⏰

## ✅ Features Implemented

### Visual Design:
- ✨ Circular SVG progress ring
- 🎨 Color-coded by time remaining:
  - **Green** (>60s): Calm, plenty of time
  - **Yellow** (30-60s): Warning, time running out
  - **Red** (<30s): Urgent, with pulse animation
- 💫 Smooth transitions and animations
- 🌟 Glowing effects on progress ring
- ⚡ Pulsing warning effect when <30s

### Functionality:
- ⏱️ MM:SS display in center
- 🔔 Sound beep at 10 seconds remaining
- ⏸️ Pause/Resume buttons
- 🛑 Auto-submit when time expires
- 💥 "Time's Up!" overlay with animation
- 📊 Progress percentage calculation

### Bonus:
- 📱 Compact timer variant for smaller spaces
- 🎵 Browser-based beep sound (no external files needed)
- ♿ Accessible with proper ARIA labels
- 🎭 Smooth animations with CSS

## 🎨 Usage Examples

### Basic Usage:
```typescript
import Timer from '@/components/Timer'

function InterviewQuestion() {
  const [isPaused, setIsPaused] = useState(false)

  const handleTimeUp = () => {
    console.log('Time expired!')
    // Auto-submit answer
    submitAnswer()
  }

  return (
    <Timer
      duration={180} // 3 minutes
      onTimeUp={handleTimeUp}
      isPaused={isPaused}
      onPause={() => setIsPaused(true)}
      onResume={() => setIsPaused(false)}
    />
  )
}
```

### With Pause Control:
```typescript
const [isPaused, setIsPaused] = useState(false)

<Timer
  duration={300} // 5 minutes
  onTimeUp={() => alert('Time up!')}
  isPaused={isPaused}
  onPause={() => setIsPaused(true)}
  onResume={() => setIsPaused(false)}
/>
```

### Compact Version (for headers/sidebars):
```typescript
import { CompactTimer } from '@/components/Timer'

<CompactTimer
  duration={180}
  timeLeft={120} // Current time remaining
/>
```

## 🎯 Props

### Timer Component:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `duration` | number | ✅ | Total time in seconds |
| `onTimeUp` | () => void | ✅ | Callback when timer expires |
| `isPaused` | boolean | ❌ | Pause state (default: false) |
| `onPause` | () => void | ❌ | Callback when pause clicked |
| `onResume` | () => void | ❌ | Callback when resume clicked |

### CompactTimer Component:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `duration` | number | ✅ | Total time in seconds |
| `timeLeft` | number | ✅ | Current time remaining |

## 🎨 Visual States

### Time Remaining > 60s (Green):
- Calm green color
- Steady progress
- "Time Remaining" label

### Time Remaining 30-60s (Yellow):
- Warning yellow color
- "Hurry Up!" label
- Slightly faster transitions

### Time Remaining < 30s (Red):
- Urgent red color
- Pulsing animation
- "Almost Done!" label
- Glowing pulse effect around timer
- Sound beep at 10s

### Time Expired:
- Full-screen overlay
- "Time's Up!" message
- Bounce-in animation
- Auto-submit triggered

## 🔊 Sound Effect

The timer plays a beep sound at 10 seconds using the Web Audio API:
- No external audio files needed
- 800Hz sine wave
- 0.5 second duration
- Plays only once

To disable sound:
```typescript
// Comment out the playBeep() call in the component
// Or add a prop to control it
```

## 🎭 Animations

### Included Animations:
1. **Progress Ring**: Smooth 1s transition
2. **Pulse Effect**: When <30s remaining
3. **Bounce-in**: For "Time's Up!" overlay
4. **Fade-in**: For overlay background
5. **Ping Effect**: Warning pulse around timer

### Custom Animation Timing:
```typescript
// Adjust in the component:
className="transition-all duration-1000" // Change 1000 to your preference
```

## 🔧 Customization

### Change Colors:
```typescript
const getColor = () => {
  if (timeLeft > 60) return { 
    stroke: '#your-color', 
    glow: 'rgba(r, g, b, 0.5)' 
  }
  // ...
}
```

### Change Warning Threshold:
```typescript
// Change from 30s to 45s:
if (timeLeft > 45) return 'text-yellow-400'
```

### Change Beep Timing:
```typescript
// Change from 10s to 15s:
if (timeLeft === 15 && !hasPlayedWarning.current) {
  playBeep()
}
```

### Adjust Circle Size:
```typescript
const radius = 90 // Change this value
// Also update SVG viewBox proportionally
```

## 📱 Responsive Design

The timer is responsive and works on all screen sizes:
- Desktop: Full 220x220px circle
- Tablet: Scales proportionally
- Mobile: Compact version recommended

## ♿ Accessibility

- Semantic HTML structure
- Color is not the only indicator (text labels change)
- Keyboard accessible pause/resume button
- Screen reader friendly

## 🚀 Integration with Interview Flow

### In InterviewRoom Component:
```typescript
import Timer from '@/components/Timer'
import { useInterview } from '@/contexts/InterviewContext'

function InterviewRoom() {
  const { selectedTemplate } = useInterview()
  const [isPaused, setIsPaused] = useState(false)
  
  const questionDuration = selectedTemplate?.duration_per_question || 180

  const handleTimeUp = () => {
    // Auto-submit current answer
    handleSubmitAnswer()
    // Move to next question
    nextQuestion()
  }

  return (
    <div className="interview-container">
      <div className="timer-section">
        <Timer
          duration={questionDuration}
          onTimeUp={handleTimeUp}
          isPaused={isPaused}
          onPause={() => setIsPaused(true)}
          onResume={() => setIsPaused(false)}
        />
      </div>
      
      {/* Rest of interview UI */}
    </div>
  )
}
```

## 🎯 Best Practices

1. **Always provide onTimeUp callback** - Handle auto-submission
2. **Use appropriate durations**:
   - Easy questions: 120s (2 min)
   - Medium questions: 180s (3 min)
   - Hard questions: 300s (5 min)
3. **Show timer prominently** - Users should always see time remaining
4. **Test sound** - Ensure beep works in target browsers
5. **Consider pause feature** - Useful for technical issues

## 🐛 Troubleshooting

**Timer doesn't start:**
- Check that duration prop is provided
- Verify component is mounted

**Sound doesn't play:**
- Check browser audio permissions
- Some browsers block audio without user interaction
- Test in different browsers

**Animation stutters:**
- Reduce transition duration
- Check for performance issues
- Use CompactTimer for better performance

**Colors don't change:**
- Verify Tailwind CSS is configured
- Check color values in getColor()

## ✨ Ready to Use!

The timer component is production-ready and can be used immediately in your interview flow!

### Quick Test:
```typescript
// Add to any page to test:
<Timer
  duration={60}
  onTimeUp={() => alert('Done!')}
/>
```

Enjoy your beautiful, functional timer! ⏰✨
