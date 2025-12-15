# UI Specification: bium (Weekly Planning View)

## Overall Style & Mood
A clean, minimalist modern web application UI in a light theme. The design language is clean and professional, using a flat design approach with subtle skeuomorphic elements to emphasize the physical container metaphor of time queues. The color palette focuses on calming blues, greens, and neutral greys, with striking red used only for warnings.

## Layout & Structure
A 2-column dashboard layout with a **collapsible, resizable sidebar** on the left and the main calendar view on the right.

```
+------------------------------------------------------------------+
|  Header: [Settings] [Weekly Plan]      [< Prev] W49 [Next >]     |
+------------------+-----------------------------------------------+
| [<] Sidebar      |                                               |
| [Inbox | Queues] |                                               |
| ---------------- |          Weekly Calendar Time Grid            |
|                  |    (Tasks auto-displayed based on Queue)      |
| (Resizable)      |                                               |
| (Collapsible)    |                                               |
|                  |                                               |
+------------------+-----------------------------------------------+
```

---

## Left Sidebar (Collapsible & Resizable)

### Sidebar Controls
- **Toggle Button:** A `<` button at the top-left corner to collapse/expand the sidebar
  - Collapsed state: Shows only icons (mini mode, ~48px width)
  - Expanded state: Full sidebar with content (default ~280px width)
- **Resize Handle:** A vertical draggable border on the right edge of the sidebar
  - Min width: 200px
  - Max width: 500px
  - Visual indicator: A subtle vertical line that highlights on hover
- **State Persistence:** Sidebar width and collapsed state saved to localStorage

### Tab Navigation
Two tabs at the top of the sidebar: `[Inbox]` `[Queues]`
- Active tab has a bottom border highlight and bolder text
- Inactive tab is slightly muted

---

### [Inbox Tab] - Task Inbox

A clean panel for capturing and staging tasks before assigning them to Queues.

**Components:**
- **Title:** "Inbox" with a count badge (e.g., "Inbox (5)")
- **Add Task Input:** 
  - Text field placeholder: "Add a new task..."
  - Clock icon with time input (required, default: 30m)
  - Enter to submit or "+" button
- **Task List:**
  - Draggable task cards in a vertical list
  - Each card is a solid, rounded rectangular block in neutral grey
  - Card content: Task title + duration badge (e.g., "60m")
  - Cards have subtle shadow to indicate they're "pickable"

---

### [Queues Tab] - Queue Dashboard

Displays all defined Queue types as cards, each containing its assigned tasks.

**Queue Card Structure:**
```
+------------------------------------------+
| [Color Bar] Deep Work           1h30m/2h |
| ---------------------------------------- |
| [============================    ] 75%   |  <- Capacity gauge
| ---------------------------------------- |
| [ ] API Design Review            45m     |
| [ ] Write Service Spec           60m     |
| ---------------------------------------- |
| Completed (2)                    [v]     |  <- Collapsible section
| [x] Setup Dev Environment        30m     |
| [x] Code Review                  25m     |
+------------------------------------------+
```

**Visual Details:**
- **Header:** Queue color indicator (left bar), Queue name, capacity usage
- **Capacity Gauge:** 
  - 0-70%: Blue/Green (comfortable)
  - 70-90%: Yellow/Orange (caution)
  - 90%+: Red with warning (over capacity)
- **Task List:** 
  - Sorted alphabetically (A-Z)
  - Checkbox for completion toggle
  - Draggable for reordering or moving back to Inbox
- **Completed Section:**
  - Collapsible via chevron icon
  - Completed tasks shown with strikethrough + grey color
  - Completed tasks do NOT count toward capacity

**Drop Zone:**
- When dragging from Inbox, Queue cards highlight with a glowing border
- Visual feedback: "Drop here to assign" tooltip

---

## Main Content Area (Weekly Calendar Time Grid)

A grid-based calendar view displaying columns for each day of the week.

### Header Row
- Day labels: "Mon 12/9", "Tue 12/10", "Wed 12/11", etc.
- Current day highlighted with accent color

### Time Grid
- Left axis: Time labels (6 AM - 10 PM in 1-hour increments)
- Grid lines: Subtle horizontal lines for each hour

### Queue Blocks on Calendar

Queues are displayed as containers at their scheduled time slots. **Tasks assigned to a Queue appear on ALL days where that Queue is scheduled.**

#### Empty Queue State
- Dashed border (Queue's color, muted)
- Transparent/light background
- Faint water tank level markers (0%, 50%, 100%)
- Center text: "Deep Work (2h)" with capacity
- Inviting appearance, ready to be filled

#### Filled Queue State (Tasks Assigned)
- Solid border (Queue's color)
- Background shows liquid-fill effect based on capacity usage
- Task blocks stacked vertically inside:
  ```
  +--------------------------------+
  | Deep Work         1h30m / 2h   |
  | [============================] |
  | +----------------------------+ |
  | | API Design Review     45m  | |
  | +----------------------------+ |
  | | Write Service Spec   60m  | |
  | +----------------------------+ |
  | | ////// Buffer 30m //////// | |  <- Hatch pattern for remaining
  | +----------------------------+ |
  +--------------------------------+
  ```
- Capacity label updates in real-time
- Buffer space shown with diagonal hatch pattern

#### Queue with Completed Tasks
- Completed tasks shown at bottom of queue
- Grey background + strikethrough text + checkmark icon
- Completed tasks visually "sink" to the bottom
- Liquid level (gauge) decreases when tasks are completed

#### Overfilled Warning State
- Intense red dashed border (animated pulse)
- Red liquid overflowing the container rim
- Top task block partially spills out of frame
- Warning icon + text: "OVER CAPACITY! (-30m)"
- Clear visual communication of time constraint violation

---

## Interaction Details

### Drag & Drop
1. **Inbox to Queue (Sidebar):**
   - Drag task from Inbox tab to Queues tab
   - Target Queue card glows on hover
   - Drop assigns task to Queue

2. **Queue to Inbox (Unassign):**
   - Drag task from Queue card back to Inbox tab
   - Task returns to unassigned state

3. **Drag Visual Feedback:**
   - Dragged item has drop shadow + semi-transparency
   - Origin position shows ghost outline
   - Valid drop targets highlight with glow effect

### Task Completion
- Click checkbox on task (in Queue card or Calendar)
- Animation: Checkmark appears, task fades to grey with strikethrough
- Capacity gauge smoothly decreases
- Task moves to "Completed" section in Queue card

### Sidebar Interactions
- **Collapse:** Click toggle button, sidebar slides left to mini mode
- **Expand:** Click toggle button or any icon in mini mode
- **Resize:** Drag right border, content reflows responsively

---

## Typography & Icons

- **Font Family:** Clean, modern sans-serif (Inter, Roboto, or system-ui)
- **Font Sizes:**
  - Header: 18px semibold
  - Queue titles: 14px semibold
  - Task titles: 14px regular
  - Duration badges: 12px medium
  - Labels: 12px regular
- **Icons:** Simple line icons (Lucide, Heroicons, or similar)
  - Clock: Time/duration
  - Calendar: Date navigation
  - Warning triangle: Over capacity
  - Checkmark: Completed
  - Chevron: Collapse/expand
  - Grip dots: Drag handle

---

## Color Palette

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary (Queue default) | Blue | #3B82F6 |
| Success/Completed | Green | #10B981 |
| Warning (70-90%) | Amber | #F59E0B |
| Danger (Over capacity) | Red | #EF4444 |
| Background | Light Grey | #F9FAFB |
| Surface | White | #FFFFFF |
| Text Primary | Dark Grey | #1F2937 |
| Text Secondary | Medium Grey | #6B7280 |
| Border | Light Grey | #E5E7EB |
| Completed Task | Muted Grey | #9CA3AF |
