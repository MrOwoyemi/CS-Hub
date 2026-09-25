// ============================================================================
// AQA GCSE COMPUTER SCIENCE 8525 -- 2027 SPECIFICATION UPDATE
// ============================================================================
// AQA updated 8525 for first teaching September 2025 and FIRST EXAMS SUMMER
// 2027. The update only *removes* content -- nothing new was added, and the
// assessment structure is unchanged. Source: AQA "Summary of changes (8525)",
// version 1.0, June 2025.
//
// Removed, and therefore not examined from 2027:
//   3.3.7  the phrase "in a computer" (wording only)
//   3.4.5  the Von Neumann architecture (as a named model)
//   3.4.5  optical secondary storage
//   3.5    LAN topologies (star and bus)
//   3.5    "explain the purpose and use of" common network protocols
//   3.5    Ethernet, Wi-Fi, UDP and FTP
//   3.5    the alternative names for the link layer
//
// Explicitly RETAINED, so do not strip these out:
//   the fetch-decode-execute cycle; the CPU components (ALU, control unit,
//   clock, register, bus); solid state, magnetic and cloud storage; the 4-layer
//   TCP/IP model; TCP, IP, HTTP, HTTPS, SMTP and IMAP; LAN/WAN/PAN; wired vs
//   wireless; and network security.
//
// Removed material is KEPT on the site and badged rather than deleted, because
// it is still useful context (the fetch-decode-execute cycle is usually taught
// via Von Neumann). It is filtered out of anything scored -- quizzes, mocks and
// connecting walls -- so practice reflects the real exam.
const SPEC_REMOVED_LABEL = 'Not examined from 2027';

// Questions drawn per topic quiz. Each topic bank holds at least 30 examinable
// questions, so ten are sampled at random and a repeat session is a fresh set.
const QUIZ_LENGTH = 10;
// Questions in a full-paper mock.
const MOCK_LENGTH = 30;

// Drop anything flagged removed2027 from a pool of scored questions.
function examinableQuestions(list) {
  return (list || []).filter(q => !q.removed2027);
}

// ============================================================================
// DESIGN MOVE 01 -- TOPIC MASTERY
// ============================================================================
// Until now the only progress kept was totalXP plus three achievement counters,
// so the site could not answer the one question a reviser actually has: which
// topic am I worst at? Every quiz answer now also updates a per-topic tally, and
// that drives the topic card colours and the "Revise next" strip.
//
// Stored as two signed integers per topic so the existing tamper check applies:
//   tq-<topic>  questions seen        ta-<topic>  answered correctly
function topicStatKey(topic, kind) {
  return kind + '-' + topic;
}

function recordTopicAnswer(topic, wasCorrect) {
  if (!topic) return;
  secureSetInt(topicStatKey(topic, 'tq'), secureGetInt(topicStatKey(topic, 'tq'), 0) + 1);
  if (wasCorrect) {
    secureSetInt(topicStatKey(topic, 'ta'), secureGetInt(topicStatKey(topic, 'ta'), 0) + 1);
  }
}

// ============================================================================
// DESIGN MOVE 02 -- DAY STREAK
// ============================================================================
// The header has always carried a flame icon and a counter labelled "Day
// Streak", but nothing ever wrote to it, so it read 0 for every student
// forever. It is now real.
//
// Two signed integers, so the existing tamper check applies:
//   streak-count  consecutive days ending on streak-last
//   streak-last   the last active day, as a whole number of days since epoch
//   streak-mask   a 14-bit history, bit 0 being streak-last, for the strip
const STREAK_HISTORY_DAYS = 14;

function dayIndex(ms) {
  return Math.floor(ms / 86400000);
}

// Called once per visit. Returns the current streak length.
function registerVisit() {
  const today = dayIndex(todayUTC());
  const last = secureGetInt('streak-last', 0);
  let streak = secureGetInt('streak-count', 0);
  let mask = secureGetInt('streak-mask', 0);

  if (last === 0) {
    streak = 1;
    mask = 1;
  } else {
    const gap = today - last;
    if (gap === 0) return streak;            // already counted today
    if (gap < 0) return streak;              // clock moved backwards; leave it alone
    // Shift the history along by the days that passed, then mark today.
    mask = gap >= STREAK_HISTORY_DAYS ? 1 : ((mask << gap) | 1);
    mask &= (1 << STREAK_HISTORY_DAYS) - 1;
    streak = (gap === 1) ? streak + 1 : 1;   // a missed day resets to today
  }

  secureSetInt('streak-last', today);
  secureSetInt('streak-count', streak);
  secureSetInt('streak-mask', mask);
  return streak;
}

// The streak as it stands right now, without recording a visit: a run that
// ended yesterday still counts, one that ended earlier has been broken.
function currentStreak() {
  const last = secureGetInt('streak-last', 0);
  if (last === 0) return 0;
  const gap = dayIndex(todayUTC()) - last;
  return (gap <= 1) ? secureGetInt('streak-count', 0) : 0;
}

// Oldest first, so the strip reads left to right ending on today.
function streakHistory() {
  const last = secureGetInt('streak-last', 0);
  const mask = secureGetInt('streak-mask', 0);
  const today = dayIndex(todayUTC());
  const days = [];
  for (let i = STREAK_HISTORY_DAYS - 1; i >= 0; i--) {
    const offsetFromLast = (today - i) - last;   // 0 is streak-last, negative is older
    const bit = -offsetFromLast;
    days.push({
      daysAgo: i,
      active: last !== 0 && bit >= 0 && bit < STREAK_HISTORY_DAYS && !!(mask & (1 << bit))
    });
  }
  return days;
}

function updateStreakUI() {
  const el = document.getElementById('streak-count');
  if (el) el.innerText = currentStreak();
}

function renderStreakStrip() {
  const host = document.getElementById('streak-strip');
  if (!host) return;
  const streak = currentStreak();
  const cells = streakHistory()
    .map(d => `<i class="${d.active ? 'on' : ''}${d.daysAgo === 0 ? ' today' : ''}"
                  title="${d.daysAgo === 0 ? 'Today' : d.daysAgo + ' days ago'}"></i>`)
    .join('');
  host.innerHTML = `
    <div class="streak-panel">
      <div class="streak-head">
        
        <span class="streak-num">${streak}</span>
        <span class="streak-word">day${streak === 1 ? '' : 's'} in a row</span>
      </div>
      <div class="streak-cal" role="img" aria-label="Activity over the last ${STREAK_HISTORY_DAYS} days">${cells}</div>
      <div class="streak-note">Last ${STREAK_HISTORY_DAYS} days &middot; open the hub each day to keep it going</div>
    </div>`;
}

// Returns {seen, correct, accuracy} or null when the topic is untouched, so
// "not started" can be shown differently from "struggling".
function getTopicMastery(topic) {
  const seen = secureGetInt(topicStatKey(topic, 'tq'), 0);
  if (seen === 0) return null;
  const correct = secureGetInt(topicStatKey(topic, 'ta'), 0);
  return { seen, correct, accuracy: Math.round((correct / seen) * 100) };
}

// Bands chosen to match the colours already used for right/wrong feedback.
function masteryBand(accuracy) {
  if (accuracy >= 80) return { label: 'Strong', colour: 'var(--accent-green)' };
  if (accuracy >= 55) return { label: 'Getting there', colour: 'var(--accent-yellow)' };
  return { label: 'Needs work', colour: 'var(--accent-red)' };
}

// The weakest topics the student has actually attempted, lowest accuracy first.
function weakestTopics(count) {
  return Object.keys(questionBank)
    .map(t => ({ topic: t, m: getTopicMastery(t) }))
    .filter(x => x.m && x.m.seen >= 3)          // ignore one-off flukes
    .sort((a, b) => a.m.accuracy - b.m.accuracy)
    .slice(0, count);
}

// 1. Homework Bank
// Single source of truth for homework reminders: the full Year 11 scheme of
// work, in ISO date order. (This previously lived in two arrays -- a 6-entry
// `homeworkBank` that the dashboard rendered, and a 24-entry `homeworkSchedule`
// that was declared but never referenced -- so most of the year's homework
// never reached the page. They are merged here.)
//
// NEEDS REPLACING: every entry below is from the 2025/26 academic year and is
// now in the past, so the dashboard shows its "No homework set" panel instead.
// Two entries also set tasks on content withdrawn for 2027 -- the Von Neumann
// labelling task (2026-01-23) and the topologies mind map (2026-02-27, which
// also set mesh -- a topology that was never on AQA 8525).
// Swap this array for the current year's scheme of work.
const homeworkBank = [
  { date: "2025-09-19", title: "3.1 Fundamentals of algorithms", task: "Create a mind map explaining the principles of computational thinking." },
  { date: "2025-09-26", title: "3.1 Fundamentals of algorithms", task: "Create two simple algorithms (average, recipe) using pseudocode and flowcharts." },
  { date: "2025-10-03", title: "3.1 Fundamentals of algorithms", task: "Make revision cards for searching and sorting algorithms with annotated data sets." },
  { date: "2025-10-10", title: "Revision", task: "Answer a selection of past exam questions on Topic 3.1." },
  { date: "2025-10-17", title: "3.2 Programming", task: "Make revision cards on fundamental programming concepts with Python examples." },
  { date: "2025-10-24", title: "3.2 Programming", task: "Create a mind map illustrating sequence, selection, and iteration with examples." },
  { date: "2025-11-07", title: "3.2 Programming", task: "Explain subroutines and create a program using a 1D array/list." },
  { date: "2025-11-14", title: "Revision", task: "Answer past exam questions on Topic 3.2. Annotate logic errors." },
  { date: "2025-11-21", title: "3.3 Data representation", task: "Revision cards for denary, binary, and hex conversions + binary addition." },
  { date: "2025-11-28", title: "3.3 Data representation", task: "Table comparing binary representation of characters, bitmaps, and sound." },
  { date: "2025-12-05", title: "3.3 Data representation", task: "Explain the difference between lossy and lossless compression with use cases." },
  { date: "2025-12-12", title: "Revision", task: "Complete practice questions on number systems and data representation." },
  { date: "2026-01-09", title: "Synoptic Revision", task: "Design an algorithm (3.1) and write the corresponding code (3.2)." },
  { date: "2026-01-16", title: "Revision", task: "Answer a selection of past exam questions on Topic 3.3." },
  { date: "2026-01-23", title: "3.4 Computer systems", task: "Label Von Neumann architecture and explain Fetch-Decode-Execute." },
  { date: "2026-01-30", title: "3.4 Computer systems", task: "Comparison table for memory/storage (speed, cost, capacity, volatility)." },
  { date: "2026-02-06", title: "3.4 Computer systems", task: "Revision cards on OS functions and common utility software." },
  { date: "2026-02-13", title: "Revision", task: "Answer past exam questions on Topic 3.4. Review misconceptions." },
  { date: "2026-02-27", title: "3.5 Computer networks", task: "Mind map explaining LAN vs WAN, and wired vs wireless networks." },
  { date: "2026-03-06", title: "3.5 Computer networks", task: "Revision cards for network hardware and the 4-layer TCP/IP model." },
  { date: "2026-03-13", title: "3.5 Computer networks", task: "Diagram illustrating DNS, hosting, and the cloud." },
  { date: "2026-03-20", title: "Topic 3.5 Revision", task: "Answer a selection of past exam questions on Topic 3.5. Network types, topologies, hardware, protocols, the Internet." },
  { date: "2026-03-27", title: "Consolidation (3.3, 3.4, 3.5)", task: "Complete Seneca Learning quizzes or similar online revision activities covering Topics 3.3, 3.4, and 3.5. Data representation, systems, networks, consolidation." },
  { date: "2026-04-17", title: "Consolidation Revision", task: "Complete a past paper (Either Paper 1 or Paper 2). Knowledge recall, application of theory." },
  { date: "2026-04-24", title: "Consolidation", task: "Complete a full past paper (Paper 1 or Paper 2)." },
  { date: "2026-04-24", title: "Activity Sheets", task: "Complete revision Activity Sheets 1 - 5." },
  { date: "2026-05-01", title: "Paper 1 Final Practice", task: "Complete the Python coding challenges on the Practical Hub. Focus on Trace Tables and logic errors." },
  { date: "2026-05-08", title: "Final Exam Prep!", task: "Use the interactive flashcards and match-up games on the dashboard to test your keyword knowledge before the big day." }
];

const questionBank = {
  // --- PAPER 1: COMPUTATIONAL THINKING ---
  "3.1.1 Representing Algorithms": [
    { q: "What is the primary purpose of 'Pseudo-code' in development?", a: "To plan programme logic without following strict language syntax", options: ["To plan programme logic without following strict language syntax", "To execute high-level instructions directly on the hardware", "To create a visual interface for end-user interaction tasks", "To compress source code files for efficient network storage"], hint: "Halfway between English and code.", why: "Pseudo-code focuses on logic rather than specific language rules." },
    { q: "In a flowchart, what does a Diamond shape represent?", a: "A decision point that branches based on a logical condition", options: ["A decision point that branches based on a logical condition", "A specific processing step where data values are modified", "An input or output operation for external data handling", "The terminal point marking the start or end of the process"], hint: "Usually an IF statement.", why: "Diamonds represent branches where the path splits based on a condition." },
    { q: "Which shape is used for Input and Output in a flowchart?", a: "A parallelogram representing data entering or leaving a system", options: ["A parallelogram representing data entering or leaving a system", "A rectangle used to define a mathematical calculation step", "An oval used to signify the starting point of the algorithm", "A diamond used to evaluate a boolean expression or choice"], hint: "Slanted sides.", why: "Parallelograms indicate data entering or leaving the system." },
    { q: "What is an algorithm?", a: "A set of step-by-step instructions to solve a task or problem", options: ["A set of step-by-step instructions to solve a task or problem", "A complex hardware component inside the central processor", "A high-level programming language used for web scripting", "A malicious software programme designed to compromise security"], hint: "Like a recipe.", why: "Algorithms are defined steps to solve a problem." },
    { q: "In flowcharts, what does a Rectangle represent?", a: "A process such as a calculation or variable assignment", options: ["A process such as a calculation or variable assignment", "A decision point requiring a Yes or No logical evaluation", "The entry or exit point for the entire set of instructions", "A manual data entry step performed by an external operator"], hint: "Calculations or assignments.", why: "Rectangles are used for general processing steps." },
    { q: "What is the term for removing unnecessary detail?", a: "Abstraction to focus only on the essential problem elements", options: ["Abstraction to focus only on the essential problem elements", "Decomposition to break a problem into smaller sub-tasks", "Iteration to repeat a block of code until a condition is met", "Selection to choose a path based on a specific input value"], hint: "Simplifying a map.", why: "Abstraction filters out details that do not help solve the core problem." },
    { q: "What is 'Decomposition'?", a: "Breaking a complex problem into smaller, manageable sub-problems", options: ["Breaking a complex problem into smaller, manageable sub-problems", "The process of removing errors from a completed programme", "Converting high-level source code into binary machine code", "Encrypting sensitive data to prevent unauthorised user access"], hint: "Sub-problems.", why: "Decomposition breaks complex tasks into manageable sub-tasks." },
    { q: "Which flowchart symbol starts and ends the diagram?", a: "A terminal oval marking the boundary of the algorithm", options: ["A terminal oval marking the boundary of the algorithm", "A process rectangle marking a specific calculation step", "A directional arrow indicating the next logical instruction", "A decision diamond evaluating the status of a variable"], hint: "The 'Stop' button.", why: "Ovals mark the entry and exit points." },
    { q: "What does an arrow represent in a flowchart?", a: "The flow of control indicating the sequence of execution", options: ["The flow of control indicating the sequence of execution", "A permanent data storage location on a secondary device", "A specific decision point where the logic must branch out", "The handling of a runtime error within the programme logic"], hint: "Direction.", why: "Arrows show the order of execution." },
    { q: "A trace table is used to...?", a: "Manually track variable values to identify logic errors", options: ["Manually track variable values to identify logic errors", "Identify syntax errors before the code is compiled", "Convert high-level code into low-level assembly language", "Establish a secure connection to a remote server database"], hint: "Dry running.", why: "Trace tables track variable values to ensure logic works." },
    { q: "What is 'Syntax'?", a: "The specific set of rules governing the grammar of a language", options: ["The specific set of rules governing the grammar of a language", "A type of loop that repeats for a fixed number of times", "A method for sorting data into a specific numerical order", "The physical speed at which a CPU processes instructions"], hint: "Grammar.", why: "Syntax refers to the grammar and spelling rules of a language." },
    { q: "Which of these is NOT a core programming construct?", a: "Data Encryption", options: ["Data Encryption", "Sequence", "Selection", "Iteration"], hint: "S.S.I.", why: "The three core constructs are Sequence, Selection, and Iteration." },
    { q: "What is a 'Variable'?", a: "A named memory location that stores data that can change", options: ["A named memory location that stores data that can change", "A fixed numerical value that remains constant during runtime", "A physical output device such as a monitor or printer", "An input peripheral used to enter data into the computer"], hint: "Stores data that can change.", why: "Variables hold data in RAM that can be modified." },
    { q: "What is 'Sequence' in algorithms?", a: "Executing instructions in the exact order they are written", options: ["Executing instructions in the exact order they are written", "Making a choice between two or more different paths", "Repeating a specific block of code using a loop structure", "Assigning a unique name to a specific memory location"], hint: "One after another.", why: "Sequence is the execution of statements in the order written." },
    { q: "Which tool is best for non-programmers to understand logic?", a: "A visual flowchart illustrating the algorithmic path", options: ["A visual flowchart illustrating the algorithmic path", "A dry-run trace table showing variable state changes", "A block of assembly code showing register movements", "A binary text file containing raw machine instructions"], hint: "Visual representation.", why: "Flowcharts provide a visual map easy for anyone to follow." },
    { q: "What is 'abstraction' in computational thinking?", a: "Removing unnecessary detail to focus on what matters", options: ["Removing unnecessary detail to focus on what matters", "Breaking a problem into smaller sub-problems", "Writing a program in a high-level language", "Testing a program with unusual input values"], hint: "Ignore the irrelevant.", why: "A tube map abstracts away real distances because only the connections matter." },
    { q: "What is 'decomposition'?", a: "Breaking a complex problem into smaller, manageable parts", options: ["Breaking a complex problem into smaller, manageable parts", "Removing detail that is not needed to solve the problem", "Converting a flowchart into working program code", "Deleting a variable once it is no longer required"], hint: "Divide the problem up.", why: "Smaller sub-problems are easier to solve, test and share between a team." },
    { q: "What does the parallelogram symbol mean in a flowchart?", a: "Input or output", options: ["Input or output", "A decision with two possible paths", "A process or calculation step", "The start or end of the algorithm"], hint: "Data going in or coming out.", why: "Parallelograms are used for anything read in from a user or printed out." },
    { q: "How many arrows leave a decision (diamond) box?", a: "Two, one for true and one for false", options: ["Two, one for true and one for false", "One, always continuing downwards", "Four, one from each corner", "None, a decision box ends the flowchart"], hint: "Yes or no.", why: "A decision tests a condition, so control flow splits into exactly two paths." },
    { q: "What is the main advantage of pseudo-code over a flowchart?", a: "It translates into real code more directly", options: ["It translates into real code more directly", "It always runs faster than the finished program", "It can be understood without reading any English", "It removes the need to test the finished program"], hint: "It already looks like code.", why: "Pseudo-code lines map almost one-to-one onto statements in a real language." },
    { q: "In pseudo-code, what does the assignment arrow in 'total ← 0' do?", a: "Stores the value 0 in the variable total", options: ["Stores the value 0 in the variable total", "Checks whether total is equal to 0", "Prints the value of total to the screen", "Deletes the variable total from memory"], hint: "It points at where the value goes.", why: "The arrow points from the value into the variable that receives it." },
    { q: "What is a 'trace table' used for?", a: "Recording how variables change line by line", options: ["Recording how variables change line by line", "Storing a program's output before it is printed", "Listing every syntax error in a program", "Measuring how much memory a program uses"], hint: "Follow the values through.", why: "Tracing by hand exposes logic errors that the computer would run without complaint." },
    { q: "When tracing an algorithm, when do you write a new row in a trace table?", a: "Whenever a variable's value changes", options: ["Whenever a variable's value changes", "Once for every line of code, even blank lines", "Only when the program produces output", "Only at the very start and very end"], hint: "Track the changes.", why: "A row per change keeps the table readable and shows the sequence of states." },
    { q: "Which shape represents a process or calculation in a flowchart?", a: "Rectangle", options: ["Rectangle", "Diamond", "Parallelogram", "Oval"], hint: "Four equal corners.", why: "Rectangles hold steps such as 'total ← total + num'." },
    { q: "What is an 'algorithm'?", a: "A precise sequence of steps that solves a problem", options: ["A precise sequence of steps that solves a problem", "A programming language used to write software", "A physical component inside the processor", "A file format used to store program output"], hint: "A recipe.", why: "An algorithm must be unambiguous and finish, whether written as code or not." },
    { q: "Why might a developer write pseudo-code before real code?", a: "To plan the logic without worrying about syntax rules", options: ["To plan the logic without worrying about syntax rules", "To make the finished program run more quickly", "To avoid having to test the program afterwards", "To reduce the size of the compiled program file"], hint: "Think first, type later.", why: "Planning separates 'what should happen' from 'how this language spells it'." },
    { q: "What is meant by 'algorithmic thinking'?", a: "Working out the steps needed to solve a problem", options: ["Working out the steps needed to solve a problem", "Memorising the syntax of a programming language", "Choosing which hardware a program will run on", "Designing the colours used in a user interface"], hint: "Steps and order.", why: "It is the skill of turning a problem into a repeatable sequence of instructions." },
    { q: "Two algorithms give the same output for every input. What can you say?", a: "They are equivalent, even if written differently", options: ["They are equivalent, even if written differently", "They must contain exactly the same instructions", "They must both take the same time to run", "One of them must contain a logic error"], hint: "Same result, different route.", why: "Equivalence is about behaviour, not about how the steps are written." },
    { q: "What does the oval (terminator) symbol show in a flowchart?", a: "The start or the stop of the algorithm", options: ["The start or the stop of the algorithm", "A calculation being performed", "A value being read from the keyboard", "A subroutine being called"], hint: "Where it begins and ends.", why: "Every flowchart needs exactly one start and at least one stop terminator." },
    { q: "In a trace table for a loop, how do you show three iterations?", a: "Three rows, one per pass through the loop", options: ["Three rows, one per pass through the loop", "One row containing all three values", "Three separate trace tables side by side", "One row, because loops repeat the same values"], hint: "A row per pass.", why: "Each iteration is a separate state, so it gets its own row." }
  ],
  "3.1.2 Efficiency of Algorithms": [
    { q: "What are the two main measures of algorithm efficiency?", a: "Execution time and memory space requirements", options: ["Execution time and memory space requirements", "Retail price and aesthetic colour of the interface", "Physical weight and vertical height of the hardware", "Number of user inputs and density of visual outputs"], hint: "Speed and RAM.", why: "Efficiency is measured by speed (time) and memory usage (space)." },
    { q: "Which algorithm is most efficient for searching large, sorted lists?", a: "Binary Search", options: ["Binary Search", "Linear Search", "Bubble Sort", "Trace Table Evaluation"], hint: "It ignores half the list.", why: "Binary search halves the search area every step." },
    { q: "What is 'Space efficiency'?", a: "The amount of working memory (RAM) required by an algorithm", options: ["The amount of working memory (RAM) required by an algorithm", "The total storage capacity of the primary hard drive", "The physical dimensions of the central processing unit", "The total number of lines found in the source code"], hint: "RAM usage.", why: "Space efficiency measures working memory needed by an algorithm." },
    { q: "Why should developers prioritise efficient algorithms?", a: "To minimise execution time and conserve system resources", options: ["To minimise execution time and conserve system resources", "To make the source code significantly harder to read", "To increase the overall cost of electricity for the user", "To require the user to purchase more expensive hardware"], hint: "Performance.", why: "Efficiency ensures programmes run quickly and don't crash devices." },
    { q: "Finding a target on the very first try is called...?", a: "Best-case complexity scenario", options: ["Best-case complexity scenario", "Average-case complexity scenario", "Worst-case complexity scenario", "Standard efficiency scenario"], hint: "The luckiest outcome.", why: "Best-case refers to the minimum steps an algorithm needs." },
    { q: "If data size 'n' doubles in a linear process, what happens?", a: "The time taken to process the data also doubles", options: ["The time taken to process the data also doubles", "The time taken to process the data remains constant", "The time taken to process the data is reduced by half", "The time taken to process the data is exactly tripled"], hint: "Checking every item.", why: "In a linear process, doubling work doubles time." },
    { q: "Which sort is inefficient due to its high number of swaps?", a: "Bubble Sort", options: ["Bubble Sort", "Merge Sort", "Quick Sort", "Binary Sort"], hint: "Many swaps.", why: "Bubble sort is inefficient due to the high number of passes." },
    { q: "When measuring efficiency, 'n' usually refers to...?", a: "The total number of items within the input dataset", options: ["The total number of items within the input dataset", "The number of loops executed within the algorithm", "The number of global variables used in the programme", "The number of syntax errors identified by the compiler"], hint: "Input size.", why: "Efficiency is measured against dataset size, represented as 'n'." },
    { q: "Which uses less memory: Merge Sort or Bubble Sort?", a: "Bubble Sort (as it sorts data in-place)", options: ["Bubble Sort (as it sorts data in-place)", "Merge Sort (as it splits data into sub-lists)", "Both algorithms use identical amounts of RAM", "Neither algorithm requires any system memory"], hint: "Splitting vs Swapping.", why: "Bubble sort is 'in-place', while Merge sort creates sub-lists." },
    { q: "Why is Merge Sort generally preferred for large lists?", a: "Its divide-and-conquer approach requires fewer total steps", options: ["Its divide-and-conquer approach requires fewer total steps", "It is much simpler for a novice to programme manually", "It requires no system memory to perform the operation", "It only functions correctly on lists that are unsorted"], hint: "Speed.", why: "Merge sort's divide-and-conquer is faster than neighbor swapping." },
    { q: "What is 'Worst-case' efficiency?", a: "The maximum number of steps an algorithm could take", options: ["The maximum number of steps an algorithm could take", "The minimum number of steps theoretically possible", "The average number of steps taken over many runs", "The total time required to identify and fix logic bugs"], hint: "Target at the end.", why: "Worst-case assumes the item is at the end or missing." },
    { q: "A 'Heuristic' algorithm is used when...?", a: "Finding an exact solution takes an impractical amount of time", options: ["Finding an exact solution takes an impractical amount of time", "The computer has been disconnected from the power supply", "The list has already been sorted into the correct order", "The user is an expert in high-level programming"], hint: "A shortcut.", why: "Heuristics provide approximate solutions when the perfect one is too slow." },
    { q: "Which grows most steeply as data volume increases?", a: "Quadratic growth typically found in nested loop structures", options: ["Quadratic growth typically found in nested loop structures", "Linear growth typically found in a single loop structure", "Constant growth where time remains the same regardless", "Logarithmic growth found in binary search processes"], hint: "Curve vs Straight line.", why: "Quadratic growth increases much more rapidly than linear growth." },
    { q: "Which algorithm generally scales poorly with data?", a: "An algorithm utilising multiple nested loop layers", options: ["An algorithm utilising multiple nested loop layers", "An algorithm utilising a single pass-through loop", "An algorithm that contains no loops or repetitions", "An algorithm consisting only of a single IF statement"], hint: "Loops inside loops.", why: "Nested loops cause operations to grow faster than single loops." },
    { q: "Efficiency is critical for which type of system?", a: "Real-time systems requiring immediate data processing", options: ["Real-time systems requiring immediate data processing", "Offline backup systems used for long-term storage", "Simple calculators used for basic arithmetic tasks", "Word processors used for creating text documents"], hint: "Instant response.", why: "Real-time systems like self-driving cars need the most efficient logic." },
    { q: "Why is a binary search usually more efficient than a linear search?", a: "It halves the remaining items with every comparison", options: ["It halves the remaining items with every comparison", "It checks several items at the same moment", "It never needs the list to be stored in memory", "It works on lists that are in a random order"], hint: "Halve it each time.", why: "Halving reduces 1,000 items to about 10 comparisons instead of up to 1,000." },
    { q: "What must be true of a list before a binary search will work?", a: "It must be sorted", options: ["It must be sorted", "It must contain only whole numbers", "It must have an even number of items", "It must be shorter than 100 items"], hint: "Order matters.", why: "Discarding half the list only makes sense if you know which half the target is in." },
    { q: "Which measure is normally used to compare algorithm efficiency?", a: "The number of steps taken as the input grows", options: ["The number of steps taken as the input grows", "The number of lines of source code written", "The number of variables the program declares", "The number of comments the programmer added"], hint: "Count the work, not the text.", why: "Step count scales with input size; code length does not tell you how it behaves." },
    { q: "An algorithm's time doubles when the list doubles. How does it scale?", a: "Linearly", options: ["Linearly", "Logarithmically", "Exponentially", "It does not scale at all"], hint: "Straight-line growth.", why: "Linear growth means work is directly proportional to the number of items." },
    { q: "Why is merge sort usually preferred over bubble sort for large lists?", a: "It needs far fewer comparisons as the list grows", options: ["It needs far fewer comparisons as the list grows", "It uses much less memory than bubble sort", "It does not need the items to be comparable", "It is far easier for a beginner to write"], hint: "Divide and conquer wins at scale.", why: "Merge sort splits the work, so its step count grows much more slowly." },
    { q: "What is the 'worst case' for a linear search?", a: "The item is last, or is not in the list at all", options: ["The item is last, or is not in the list at all", "The item is the very first one checked", "The list has already been sorted", "The list contains duplicate values"], hint: "Check everything.", why: "With no early match, every one of the n items must be compared." },
    { q: "Roughly how many comparisons does a binary search need on 1,000 items?", a: "About 10", options: ["About 10", "About 100", "About 500", "About 1,000"], hint: "Keep halving 1,000.", why: "1,000 halves to 500, 250, 125 and so on, reaching one after about 10 steps." },
    { q: "Which resource, other than time, is used to judge an algorithm?", a: "Memory (space) used", options: ["Memory (space) used", "The colour scheme of the output", "The number of programmers on the team", "The brand of processor it runs on"], hint: "Time and space.", why: "An algorithm can trade extra memory for speed, so both are measured." },
    { q: "Bubble sort finishes a full pass with no swaps. What does that mean?", a: "The list is already sorted and it can stop", options: ["The list is already sorted and it can stop", "The list is in reverse order", "An error has occurred in the comparison", "Exactly one more pass is still required"], hint: "Nothing left to move.", why: "If nothing was out of order during a whole pass, sorting is complete." },
    { q: "Why is efficiency more important for large data sets than small ones?", a: "Small differences in growth become huge at scale", options: ["Small differences in growth become huge at scale", "Small data sets cannot be sorted at all", "Large data sets always fit in cache memory", "Efficiency only applies to sorted data"], hint: "Growth compounds.", why: "On ten items any algorithm feels instant; on ten million the difference is hours." },
    { q: "What is a 'best case' input for a linear search?", a: "The target is the first item in the list", options: ["The target is the first item in the list", "The target is the last item in the list", "The target is not present at all", "The list is sorted in reverse order"], hint: "Found immediately.", why: "A single comparison succeeds, so the best case takes constant time." },
    { q: "Which sort repeatedly compares neighbouring items and swaps them?", a: "Bubble sort", options: ["Bubble sort", "Merge sort", "Binary sort", "Linear sort"], hint: "Values rise like bubbles.", why: "Bubble sort walks the list swapping adjacent pairs that are out of order." },
    { q: "Why can an inefficient algorithm still be a sensible choice?", a: "It may be simpler to write and fast enough on small data", options: ["It may be simpler to write and fast enough on small data", "It always produces more accurate results", "It uses no memory while it is running", "Inefficient algorithms never contain bugs"], hint: "Fast enough is fast enough.", why: "Developer time matters too, and on tiny lists the difference is unmeasurable." },
    { q: "An algorithm takes the same time regardless of list size. What is that?", a: "Constant time", options: ["Constant time", "Linear time", "Logarithmic time", "Exponential time"], hint: "Never changes.", why: "Reading the first item of a list takes one step whether it holds 10 or 10 million." },
    { q: "Merge sort splits a list of 8 items. How many times can it halve it?", a: "3", options: ["3", "2", "4", "8"], hint: "8 to 4 to 2 to 1.", why: "Three halvings reach single items, which is why merge sort scales so well." }
  ],
  "3.1.3 Searching Algorithms": [
    { q: "Which search checks every item in a sequence from the start?", a: "Linear Search", options: ["Linear Search", "Binary Search", "Bubble Search", "Merge Search"], hint: "One by one.", why: "Linear search checks every element sequentially." },
    { q: "What is the primary requirement for a Binary Search to work?", a: "The dataset must be pre-sorted in a specific order", options: ["The dataset must be pre-sorted in a specific order", "The dataset must consist entirely of integer values", "The dataset must be small enough to fit in the cache", "The dataset must be encoded in a binary format"], hint: "Order.", why: "Binary search relies on a sorted list to discard halves." },
    { q: "How does a Binary Search reduce the search area?", a: "By eliminating half of the remaining list at each step", options: ["By eliminating half of the remaining list at each step", "By checking every second item in the remaining list", "By comparing only the first and last items of the list", "By utilising multiple processors to scan the data"], hint: "Dividing.", why: "It checks the middle and eliminates the impossible half." },
    { q: "In a list of 10 items, what is the max checks for a Linear Search?", a: "10 (if the item is at the end or missing)", options: ["10 (if the item is at the end or missing)", "1 (if the item is at the very beginning)", "5 (the average number of checks required)", "100 (if the list needs to be checked ten times)"], hint: "Worst-case.", why: "You must check every item once if it is at the end." },
    { q: "Which search is better for an unordered list?", a: "Linear Search", options: ["Linear Search", "Binary Search", "Both", "Neither"], hint: "No prep.", why: "Linear search doesn't require sorted data." },
    { q: "In a sorted list of 8 items, what is the max checks for Binary Search?", a: "4", options: ["3", "8", "4", "1"], hint: "Count the items checked, not the halvings.", why: "Each check halves what is left: 8, then 4, then 2, then 1 item, and that last item still has to be checked. That is 4 checks." },
    { q: "What happens if a search target is not present in the list?", a: "The algorithm returns a flag value like -1 or False", options: ["The algorithm returns a flag value like -1 or False", "The computer hardware will experience a fatal crash", "The algorithm will delete the entire contents of the list", "The programme will continue searching in an infinite loop"], hint: "Signal failure.", why: "Algorithms return flag values to show the item wasn't found." },
    { q: "Which search is also known as a 'Sequential Search'?", a: "Linear Search", options: ["Linear Search", "Binary Search", "Bubble Search", "Quick Search"], hint: "In sequence.", why: "It looks at elements one after the other." },
    { q: "Which search utilises 'low', 'mid', and 'high' pointers?", a: "Binary Search", options: ["Binary Search", "Linear Search", "Bubble Sort", "Merge Sort"], hint: "Halving.", why: "Binary search tracks the current range with these markers." },
    { q: "Why is Binary Search considered more efficient than Linear?", a: "It performs significantly fewer comparisons on large datasets", options: ["It performs significantly fewer comparisons on large datasets", "It is much easier for a beginner to write in Python", "It does not require the use of any local variables", "It is compatible with both sorted and unsorted lists"], hint: "Efficiency.", why: "It halves remaining items with every comparison." },
    { q: "Linear search is most efficient when...?", a: "The target item is located at the very start of the list", options: ["The target item is located at the very start of the list", "The target item is located at the very end of the list", "The list has been sorted into a specific numerical order", "The list contains a very large number of data items"], hint: "Instant find.", why: "If the first item is the target, it stops immediately." },
    { q: "What is the initial step in performing a Binary Search?", a: "Calculate the middle index of the current search range", options: ["Calculate the middle index of the current search range", "Compare the target value to the first item in the list", "Sort the entire list into an ascending numerical order", "Request the search target value from the user input"], hint: "Start in the centre.", why: "The algorithm starts by checking the middle element." },
    { q: "What constitutes the 'Best Case' for a Binary Search?", a: "The middle item is the target on the first comparison", options: ["The middle item is the target on the first comparison", "The target item is located at the start of the list", "The target item is located at the end of the list", "The search is performed on a completely empty list"], hint: "First split.", why: "If the first mid-point is the target, it finishes in one step." },
    { q: "For a million sorted items, which search is most practical?", a: "Binary Search", options: ["Binary Search", "Linear Search", "Bubble Search", "Insertion Search"], hint: "Speed.", why: "Binary takes ~20 steps; Linear could take a million." },
    { q: "A physical dictionary search is most similar to which algorithm?", a: "Binary Search", options: ["Binary Search", "Linear Search", "Bubble Search", "Merge Search"], hint: "Open to the middle.", why: "Books are sorted, allowing you to skip large sections." },
    { q: "What is the first item a binary search examines?", a: "The middle item of the list", options: ["The middle item of the list", "The first item of the list", "The last item of the list", "A randomly chosen item"], hint: "Start in the centre.", why: "Comparing with the middle lets you discard one half immediately." },
    { q: "A binary search finds the middle item is too small. What happens?", a: "The lower half is discarded", options: ["The lower half is discarded", "The upper half is discarded", "The search restarts from the beginning", "The list is sorted again"], hint: "The target must be higher.", why: "If the middle is below the target, everything below it is below the target too." },
    { q: "Which search works on an unsorted list?", a: "Linear search", options: ["Linear search", "Binary search", "Both need the list sorted", "Neither works on unsorted data"], hint: "Just check them all.", why: "A linear search makes no assumption about order, so it always works." },
    { q: "What does a search algorithm return when the item is not found?", a: "An indication that the item is absent", options: ["An indication that the item is absent", "The first item in the list", "A randomly chosen index", "The length of the list"], hint: "Report the failure.", why: "Programs commonly return -1 or False so the caller can handle the miss." },
    { q: "A binary search's low pointer passes its high pointer. What does that mean?", a: "The item is not in the list", options: ["The item is not in the list", "The item has been found", "The list needs sorting first", "The middle must be recalculated"], hint: "The range has closed.", why: "Crossing pointers means the search range is empty, so the target is absent." },
    { q: "How is the middle index calculated in a binary search?", a: "By taking the whole-number average of low and high", options: ["By taking the whole-number average of low and high", "By halving the value stored at the first index", "By choosing the index closest to the target value", "By dividing the target by two"], hint: "(low + high) DIV 2.", why: "Integer division keeps the index whole so it can be used to access the list." },
    { q: "Why does a linear search suit a short list?", a: "It is simple and the list is too small for the difference to matter", options: ["It is simple and the list is too small for the difference to matter", "It is always faster than any other search", "It automatically sorts the list as it goes", "It uses no comparisons at all"], hint: "Simplicity wins when n is tiny.", why: "On five items, sorting first to allow a binary search would cost more than it saves." },
    { q: "A list of 16 items is binary searched. What is the maximum comparisons?", a: "5", options: ["5", "4", "8", "16"], hint: "16, 8, 4, 2, 1.", why: "Each comparison halves the range, needing five steps to reach a single item." },
    { q: "What happens to a binary search if the list is not sorted?", a: "It may report an item as missing when it is present", options: ["It may report an item as missing when it is present", "It automatically sorts the list first", "It always crashes with an error", "It becomes a linear search instead"], hint: "Wrong half discarded.", why: "Discarding a half is only valid if order guarantees the target cannot be there." },
    { q: "Which search would you use to find a name in an unsorted register?", a: "Linear search", options: ["Linear search", "Binary search", "Merge search", "Bubble search"], hint: "No order to exploit.", why: "Without sorted data, checking each entry in turn is the only reliable option." },
    { q: "In a linear search, when should the algorithm stop early?", a: "As soon as the target is found", options: ["As soon as the target is found", "After exactly half the list is checked", "Only when the end of the list is reached", "When two equal items are found"], hint: "Stop when you have it.", why: "Continuing after a match wastes comparisons for no benefit." },
    { q: "What is the main disadvantage of a binary search?", a: "The data must be kept in sorted order", options: ["The data must be kept in sorted order", "It can only search lists of numbers", "It uses far more memory than a linear search", "It cannot report when an item is missing"], hint: "Sorting has a cost.", why: "Keeping data sorted takes work, which may outweigh the faster searching." },
    { q: "A binary search on 1,000,000 items needs roughly how many comparisons?", a: "About 20", options: ["About 20", "About 100", "About 1,000", "About 500,000"], hint: "2 to the power 20 is about a million.", why: "Twenty halvings reduce a million items to one, which is why it scales so well." },
    { q: "What does 'linear' describe in a linear search?", a: "Items are checked one after another in a line", options: ["Items are checked one after another in a line", "The list must be drawn as a straight line", "The search only works on straight-line graphs", "The list is split into two lines"], hint: "In sequence.", why: "The algorithm walks the list in order from one end to the other." },
    { q: "Which is checked first when a binary search targets the smallest item?", a: "The middle item, which will be too large", options: ["The middle item, which will be too large", "The first item, which matches immediately", "The last item, which will be too large", "A random item near the start"], hint: "Always start centrally.", why: "Binary search always begins in the middle, then discards the upper half." }
  ],
  "3.1.4 Sorting Algorithms": [
    { q: "Which sort compares adjacent items and swaps them if needed?", a: "Bubble Sort", options: ["Bubble Sort", "Merge Sort", "Insertion Sort", "Quick Sort"], hint: "Bubbles rising.", why: "Bubble sort steps through the list swapping adjacent items." },
    { q: "Which algorithm follows a 'divide and conquer' methodology?", a: "Merge Sort", options: ["Merge Sort", "Bubble Sort", "Insertion Sort", "Linear Sort"], hint: "Splitting and joining.", why: "Merge sort recursively divides the list and merges it back." },
    { q: "What defines an 'In-place' sorting algorithm?", a: "It requires minimal additional memory to rearrange data", options: ["It requires minimal additional memory to rearrange data", "It only functions correctly on a single local computer", "It is the fastest possible method for sorting any list", "It deletes the original data once the sort is complete"], hint: "RAM efficiency.", why: "In-place sorts modify the original list without needing copies." },
    { q: "How is the completion of a Bubble Sort confirmed?", a: "A complete pass occurs where no swaps are performed", options: ["A complete pass occurs where no swaps are performed", "The algorithm has completed a single pass of the list", "Every item in the list is confirmed to be a positive value", "The computer sends an audio alert to the user interface"], hint: "No changes.", why: "Zero swaps in a pass means every item is in position." },
    { q: "Which sorting method is most efficient for very large datasets?", a: "Merge Sort", options: ["Merge Sort", "Bubble Sort", "Insertion Sort", "All are equally efficient"], hint: "Splitting work.", why: "Merge sort's halving method is faster for large data." },
    { q: "Which sort builds a sorted sub-list one item at a time?", a: "Insertion Sort", options: ["Insertion Sort", "Bubble Sort", "Merge Sort", "Selection Sort"], hint: "Like sorting cards.", why: "It takes items and places them in the sorted section." },
    { q: "Which algorithm typically has the highest memory overhead?", a: "Merge Sort", options: ["Merge Sort", "Bubble Sort", "Insertion Sort", "Quick Sort"], hint: "Sub-lists.", why: "Merge sort creates many small lists, requiring more RAM." },
    { q: "Which sort is generally considered the easiest for a novice to code?", a: "Bubble Sort", options: ["Bubble Sort", "Merge Sort", "Quick Sort", "Radix Sort"], hint: "Simple swaps.", why: "Bubble sort uses simple nested loops." },
    { q: "In Bubble Sort, where is the largest item after the first pass?", a: "It has moved to the final position in the list", options: ["It has moved to the final position in the list", "It has moved to the starting position in the list", "It has been temporarily removed from the memory", "It remains in its original position in the list"], hint: "Bubbles up.", why: "The largest item is swapped until it hits the end." },
    { q: "Which sort is highly efficient for data that is almost sorted?", a: "Insertion Sort", options: ["Insertion Sort", "Merge Sort", "Bubble Sort", "Quick Sort"], hint: "Fewer moves.", why: "Insertion sort does very little if the data is mostly in order." },
    { q: "Why is the sorting of data essential in computer science?", a: "It enables the use of efficient Binary Search algorithms", options: ["It enables the use of efficient Binary Search algorithms", "It significantly reduces the total size of the data file", "It prevents computer viruses from infecting the system", "It reduces the amount of power consumed by the CPU"], hint: "Future searching.", why: "Sorting is required for highly efficient Binary Search." },
    { q: "What occurs during the final phase of a Merge Sort?", a: "The sorted sub-lists are combined into one single list", options: ["The sorted sub-lists are combined into one single list", "The first and last items of the list are swapped", "The original list is split into two equal halves", "The sub-lists are deleted to free up system memory"], hint: "The name.", why: "The last step combines sorted halves." },
    { q: "How many passes are needed to bubble sort a list of size 'n'?", a: "A maximum of n-1 passes are required", options: ["A maximum of n-1 passes are required", "Exactly n passes are required for every list", "Only one pass is ever required for any list", "Ten passes are required regardless of list size"], hint: "n-1.", why: "You need 4 passes for 5 items to guarantee position." },
    { q: "Which is the slowest for 10,000 completely random items?", a: "Bubble Sort", options: ["Bubble Sort", "Merge Sort", "Insertion Sort", "All methods are equal"], hint: "Inefficiency.", why: "Bubble sort's high swap count makes it very slow." },
    { q: "Which sort mimics the way people naturally sort playing cards?", a: "Insertion Sort", options: ["Insertion Sort", "Merge Sort", "Bubble Sort", "Quick Sort"], hint: "Placing cards.", why: "Humans naturally insert items into a sorted hand." },
    { q: "What are the two stages of a merge sort?", a: "Divide the list, then merge the parts back in order", options: ["Divide the list, then merge the parts back in order", "Compare neighbours, then swap them", "Count the values, then rewrite the list", "Search for the smallest, then delete it"], hint: "Divide and conquer.", why: "Splitting to single items and merging in order is what makes it efficient." },
    { q: "How many passes does a bubble sort need on a list of n items?", a: "Up to n-1 passes", options: ["Up to n-1 passes", "Exactly 2 passes", "Exactly n passes", "Always just 1 pass"], hint: "One item settles per pass.", why: "Each pass fixes one more item, and the last item is then already in place." },
    { q: "After the first pass of a bubble sort, which item is in its final place?", a: "The largest item, at the end", options: ["The largest item, at the end", "The smallest item, at the start", "The middle item", "No item is settled yet"], hint: "It bubbles to the top.", why: "The biggest value is swapped along until it reaches the far end." },
    { q: "Why is merge sort called a 'divide and conquer' algorithm?", a: "It splits the problem into smaller ones and combines the answers", options: ["It splits the problem into smaller ones and combines the answers", "It divides every value by two before sorting", "It conquers the list by comparing neighbours", "It divides the list between several processors"], hint: "Split, solve, recombine.", why: "Small sorted lists are cheap to merge, and merging is what does the sorting." },
    { q: "What is the main disadvantage of merge sort?", a: "It needs extra memory to hold the sub-lists", options: ["It needs extra memory to hold the sub-lists", "It only works on lists of even length", "It cannot sort text, only numbers", "It is slower than bubble sort on large lists"], hint: "Space for the halves.", why: "Merge sort trades memory for speed by building new lists as it merges." },
    { q: "In a merge sort, what is compared during the merge step?", a: "The front item of each sub-list", options: ["The front item of each sub-list", "The middle item of each sub-list", "Every item against every other item", "The last item of the whole list"], hint: "Look at the two fronts.", why: "Both sub-lists are sorted, so the smaller front item is always next overall." },
    { q: "Why is bubble sort a poor choice for a large list?", a: "The number of comparisons grows very quickly with size", options: ["The number of comparisons grows very quickly with size", "It needs the list to be sorted already", "It cannot handle duplicate values", "It uses more memory than merge sort"], hint: "Comparisons multiply.", why: "Roughly n squared comparisons make it impractical once n gets large." },
    { q: "What is the main advantage of bubble sort?", a: "It is very simple to understand and write", options: ["It is very simple to understand and write", "It is the fastest sort for large lists", "It needs no memory to run", "It works without comparing any values"], hint: "Simplicity.", why: "Its simplicity makes it a common teaching example despite its poor speed." },
    { q: "Merge sort splits [5,3,8,1] fully. What are the sub-lists?", a: "[5] [3] [8] [1]", options: ["[5] [3] [8] [1]", "[5,3] [8,1]", "[5,3,8] [1]", "[1,3,5,8]"], hint: "Keep halving to single items.", why: "A single item is sorted by definition, which is where merging starts." },
    { q: "Bubble sort compares 4 and 7 in ascending order. What happens?", a: "Nothing, they are already in order", options: ["Nothing, they are already in order", "They are swapped", "Both are deleted", "The pass restarts"], hint: "4 is less than 7.", why: "A swap only occurs when the left value is greater than the right one." },
    { q: "Merging [2,6] and [1,4] — what is the first item taken?", a: "1", options: ["1", "2", "4", "6"], hint: "Compare the two fronts.", why: "Comparing fronts 2 and 1 takes the smaller, so 1 goes first." },
    { q: "What does it mean for a sorting algorithm to be 'in place'?", a: "It sorts using the original list without a large copy", options: ["It sorts using the original list without a large copy", "It sorts the list before it is stored", "It places each item at a fixed index", "It sorts without comparing any items"], hint: "No big second list.", why: "Bubble sort is in place; merge sort is not, because it builds new sub-lists." },
    { q: "Which sort would suit a nearly-sorted short list?", a: "Bubble sort, which can finish after one clean pass", options: ["Bubble sort, which can finish after one clean pass", "Merge sort, which ignores existing order", "Binary sort, which halves the list", "Neither can handle nearly-sorted data"], hint: "It can detect no swaps.", why: "With a no-swap check, bubble sort spots an already-sorted list in one pass." },
    { q: "How many items are in each sub-list at the deepest level of a merge sort?", a: "One", options: ["One", "Two", "Four", "Half the list"], hint: "Split until you cannot.", why: "Splitting stops at single items, which are trivially in order." },
    { q: "What is the result of sorting ['pear','apple','fig'] alphabetically?", a: "apple, fig, pear", options: ["apple, fig, pear", "fig, pear, apple", "pear, fig, apple", "apple, pear, fig"], hint: "Compare first letters.", why: "Strings compare character by character using their character-set values." }
  ],
  "3.2.1 Data Types": [
    { q: "Which data type stores a whole number?", a: "Integer", options: ["Integer", "Real", "String", "Boolean"], hint: "No decimal points.", why: "Integers are whole numbers used for counting and indexing." },
    { q: "What is the best data type for a price like £19.99?", a: "Real / Float (numbers with fractional parts)", options: ["Real / Float (numbers with fractional parts)", "Integer (whole numbers with no decimals)", "String (a sequence of alphanumeric symbols)", "Boolean (a logic gate with two distinct states)"], hint: "Needs a decimal point.", why: "Real or Float types allow for fractional numbers." },
    { q: "Which data type stores a sequence of characters?", a: "String (a collection of characters in quotes)", options: ["String (a collection of characters in quotes)", "Character (a single alphanumeric symbol unit)", "Integer (a whole numerical value in memory)", "Boolean (a binary value representing true/false)"], hint: "Used for words.", why: "A string is a collection of characters enclosed in quotes." },
    { q: "What data type would store a 'Yes/No' answer?", a: "Boolean (representing one of two logical states)", options: ["Boolean (representing one of two logical states)", "Integer (representing any whole numerical value)", "String (representing a sequence of text symbols)", "Character (representing a single keyboard unit)"], hint: "True or False.", why: "Booleans store binary logic values." },
    { q: "What is 'Casting' in programming?", a: "Converting a variable from one data type to another", options: ["Converting a variable from one data type to another", "Deleting a variable to free up system resources", "Assigning a unique identifier to a local function", "Encapsulating a method within a private class"], hint: "Changing a string into an integer.", why: "Casting allows you to treat data as a different type for calculations." },
    { q: "Which type stores a single letter or symbol?", a: "Character (a single alphanumeric data unit)", options: ["Character (a single alphanumeric data unit)", "String (a sequence of multiple character units)", "Integer (a whole number used for calculation)", "Real (a number containing a decimal fractional)"], hint: "Just one unit.", why: "A Char data type is optimised for single character storage." },
    { q: "If you add two strings '10' and '5', what is the result?", a: "'105' (due to string concatenation rules)", options: ["'105' (due to string concatenation rules)", "15 (calculated as a mathematical addition)", "50 (calculated as a mathematical product)", "An Error (due to incompatible data types)"], hint: "Joining strings.", why: "Adding strings joins them rather than performing math." },
    { q: "What is the purpose of a 'Constant'?", a: "To store a value that cannot be changed during execution", options: ["To store a value that cannot be changed during execution", "To store user input that varies with every programme run", "To create a loop that repeats until a condition is met", "To save memory by deleting variables after their use"], hint: "Think of Pi.", why: "Constants protect values from being modified during execution." },
    { q: "Which data type uses the least memory for logic?", a: "Boolean (requiring only a single bit of storage)", options: ["Boolean (requiring only a single bit of storage)", "String (requiring one byte per character stored)", "Real (requiring multiple bytes for decimal precision)", "Integer (requiring several bytes for whole values)"], hint: "Only 1 bit needed.", why: "Booleans only need a single bit to represent True or False." },
    { q: "What is a 'Global variable'?", a: "A variable accessible by any part of the programme", options: ["A variable accessible by any part of the programme", "A variable that only functions across a web network", "A variable whose value remains constant and fixed", "A variable defined only within a specific loop"], hint: "Universal scope.", why: "Global variables are declared outside subroutines." },
    { q: "What is a 'Local variable'?", a: "A variable only accessible within its own subroutine", options: ["A variable only accessible within its own subroutine", "A variable stored permanently on the hard drive", "A variable that only accepts integer data types", "A variable that updates very slowly during execution"], hint: "Limited scope.", why: "Local variables exist only while their subroutine is running." },
    { q: "Which is a valid variable name?", a: "user_score (using an underscore for clarity)", options: ["user_score (using an underscore for clarity)", "1stScore (starting with a numerical digit)", "user score (containing a space between words)", "score! (containing a restricted symbol)"], hint: "Look for underscores.", why: "Names cannot start with numbers or have spaces." },
    { q: "What is 'Assignment'?", a: "Storing a specific value in a named variable", options: ["Storing a specific value in a named variable", "Comparing two separate values for equality", "Defining the name of the entire programme file", "Printing data to the screen for user feedback"], hint: "The = symbol.", why: "Assignment gives a value to a named memory location." },
    { q: "Why use meaningful variable names?", a: "To improve code readability and maintainability", options: ["To improve code readability and maintainability", "To make the CPU process the instructions faster", "To reduce the amount of space taken on the disk", "To prevent the compiler from finding syntax errors"], hint: "Readability.", why: "Human programmers need to understand what data a variable holds." },
    { q: "What data type is used for '3.14159'?", a: "Real / Float (supporting decimal precision)", options: ["Real / Float (supporting decimal precision)", "Integer (supporting only whole number values)", "Boolean (supporting binary logic states only)", "String (supporting text-based symbol sequences)"], hint: "It has a decimal point.", why: "Decimal values require the Real/Float data type." },
    { q: "Which data type would best store a person's height in metres?", a: "Real (float)", options: ["Real (float)", "Integer", "Boolean", "Character"], hint: "It has a decimal point.", why: "Heights such as 1.72 need a fractional part, which integers cannot hold." },
    { q: "Which data type stores only True or False?", a: "Boolean", options: ["Boolean", "Integer", "String", "Real"], hint: "Two possible values.", why: "Booleans drive conditions in selection and iteration." },
    { q: "What data type is the value \"27\" written with quotes?", a: "String", options: ["String", "Integer", "Real", "Boolean"], hint: "Quotes make it text.", why: "Quotes mean the characters 2 and 7, not the number twenty-seven." },
    { q: "Why can you not do arithmetic on a string of digits directly?", a: "The computer treats them as characters, not numbers", options: ["The computer treats them as characters, not numbers", "Strings use too much memory for arithmetic", "Arithmetic only works on Boolean values", "Strings are always stored in reverse order"], hint: "Cast it first.", why: "'5' + '5' joins to '55'; casting to integer first gives 10." },
    { q: "Which data type suits a mobile phone number?", a: "String, because it may start with a zero", options: ["String, because it may start with a zero", "Integer, because it contains only digits", "Real, because it is a long number", "Boolean, because it is either valid or not"], hint: "Leading zeros matter.", why: "Storing 07123 as an integer would silently lose the leading zero." },
    { q: "What does casting mean?", a: "Converting a value from one data type to another", options: ["Converting a value from one data type to another", "Copying a variable into a new name", "Deleting a value from memory", "Rounding a real number to the nearest integer"], hint: "Change its type.", why: "int('7') converts the text '7' into the number 7 so it can be used in sums." },
    { q: "Which data type stores a single letter?", a: "Character", options: ["Character", "String", "Integer", "Boolean"], hint: "Just one symbol.", why: "A character holds exactly one symbol; a string holds a sequence of them." },
    { q: "Why does choosing the right data type matter?", a: "It saves memory and prevents invalid operations", options: ["It saves memory and prevents invalid operations", "It changes the colour of the output", "It makes the program file smaller to download", "It removes the need for variable names"], hint: "Space and safety.", why: "A Boolean needs one bit while a string needs many bytes, and types block nonsense operations." },
    { q: "What is the result of int(7.9) in most languages?", a: "7", options: ["7", "8", "7.9", "An error"], hint: "It truncates.", why: "Casting to an integer usually chops off the fractional part rather than rounding." },
    { q: "Which type would store whether a pupil is present?", a: "Boolean", options: ["Boolean", "Real", "String", "Character"], hint: "Yes or no.", why: "Present or absent has exactly two states, which is what a Boolean models." },
    { q: "What happens if you add a real and an integer together?", a: "The result is usually a real number", options: ["The result is usually a real number", "The program always crashes", "The real is converted to an integer first", "The result is always a string"], hint: "Keep the precision.", why: "The integer is promoted so the fractional part of the real is not lost." },
    { q: "Which is a valid Boolean expression?", a: "age >= 18", options: ["age >= 18", "age = 18 + 1", "age * 2", "'age'"], hint: "It must evaluate to True or False.", why: "A comparison produces a Boolean; a calculation produces a number." },
    { q: "Why is a real number sometimes stored imprecisely?", a: "Some fractions cannot be represented exactly in binary", options: ["Some fractions cannot be represented exactly in binary", "Real numbers are always rounded to whole numbers", "The computer stores them as text", "Reals are limited to two decimal places"], hint: "Binary fractions.", why: "Values such as 0.1 recur in binary, so tiny rounding errors can build up." },
    { q: "What data type does input() return by default in Python?", a: "String", options: ["String", "Integer", "Real", "Boolean"], hint: "Always text.", why: "Everything typed is text, which is why numeric input must be cast." },
    { q: "Which type would you use to count the pupils in a class?", a: "Integer", options: ["Integer", "Real", "Boolean", "Character"], hint: "Whole things.", why: "You cannot have 24.5 pupils, so a whole number type is correct." }
  ],
  "3.2.2 Programming Constructs": [
    { q: "What are the three basic constructs?", a: "Sequence, Selection, and Iteration", options: ["Sequence, Selection, and Iteration", "Input, Process, and Output", "Hardware, Software, and Users", "Binary, Hex, and Denary"], hint: "S, S, I.", why: "These three structures form the logic of every programme." },
    { q: "Which construct is used for making decisions?", a: "Selection (such as IF or CASE statements)", options: ["Selection (such as IF or CASE statements)", "Sequence (running code in a linear order)", "Iteration (repeating code using a loop)", "Variable (storing a changing data value)"], hint: "IF... ELSE.", why: "Selection allows a programme to branch based on a condition." },
    { q: "What is 'Iteration'?", a: "The repetition of a block of code until a condition is met", options: ["The repetition of a block of code until a condition is met", "The linear execution of instructions in order", "The process of naming a variable or constant", "The identification of a logic error in a programme"], hint: "Loops.", why: "Iteration repeats instructions until a condition is met." },
    { q: "Which loop is 'Count-controlled'?", a: "FOR loop (repeating for a fixed number of times)", options: ["FOR loop (repeating for a fixed number of times)", "WHILE loop (repeating while a condition is true)", "REPEAT loop (repeating until a condition is true)", "IF statement (choosing between two paths)"], hint: "Repeat 10 times.", why: "FOR loops run for a predetermined number of times." },
    { q: "Which loop is 'Condition-controlled'?", a: "WHILE loop (repeating based on a boolean state)", options: ["WHILE loop (repeating based on a boolean state)", "FOR loop (repeating for a specific count)", "Sequence (executing code in a single line)", "Assignment (setting the value of a variable)"], hint: "Repeat until False.", why: "WHILE loops repeat as long as a test remains True." },
    { q: "What is an 'Infinite loop'?", a: "A loop whose exit condition is never satisfied", options: ["A loop whose exit condition is never satisfied", "A loop that executes exactly 100 times", "A loop placed inside another loop structure", "A loop that causes a fatal hardware crash"], hint: "Condition never fails.", why: "If the exit condition is never met, the loop runs forever." },
    { q: "What is a 'Nested' construct?", a: "A control structure placed inside another structure", options: ["A control structure placed inside another structure", "A control structure that contains no instructions", "A control structure designed for web development", "A control structure that has been deleted"], hint: "IF inside a FOR loop.", why: "Nesting allows for complex logic by layering structures." },
    { q: "What is 'Sequence'?", a: "The order in which instructions are executed", options: ["The order in which instructions are executed", "Choosing between different available paths", "The repetition of a task until finished", "The process of naming a function or method"], hint: "Top to bottom.", why: "Sequence ensures code executes in the order written." },
    { q: "What is a 'Subroutine'?", a: "A named, reusable block of code for a specific task", options: ["A named, reusable block of code for a specific task", "A small variable stored in the CPU registers", "A file saved to the secondary storage device", "A physical hardware component of the motherboard"], hint: "Functions/Procedures.", why: "Subroutines allow code reuse and organisation." },
    { q: "What is the difference between a Function and a Procedure?", a: "Functions return a value; Procedures do not", options: ["Functions return a value; Procedures do not", "Procedures return a value; Functions do not", "Functions are always longer than procedures", "Procedures are only used for mathematical tasks"], hint: "The 'Return' keyword.", why: "Functions calculate and send back data to the programme." },
    { q: "What is a 'Parameter'?", a: "A variable used in a subroutine to receive data", options: ["A variable used in a subroutine to receive data", "A numerical limit for a count-controlled loop", "The unique name given to a programme file", "A type of runtime error found in complex code"], hint: "Input for a function.", why: "Parameters allow you to pass data into a subroutine." },
    { q: "Why is indentation used in programming?", a: "To visually represent the structure and scope of code", options: ["To visually represent the structure and scope of code", "To make the CPU process instructions faster", "To save battery power on portable devices", "To prevent all syntax errors from occurring"], hint: "Readability.", why: "Indentation visually defines the scope of loops and blocks." },
    { q: "What is an 'Argument'?", a: "The actual value passed into a subroutine parameter", options: ["The actual value passed into a subroutine parameter", "A logic bug identified during programme testing", "The specific name given to a local variable", "A comment written to explain the code logic"], hint: "Data in the brackets.", why: "Arguments are specific values given to parameters." },
    { q: "Which statement handles multiple alternative conditions?", a: "ELIF / Switch (handling three or more paths)", options: ["ELIF / Switch (handling three or more paths)", "Nested Loop (repeating code inside a loop)", "Boolean Logic (evaluating only true/false)", "Constant (storing a single fixed value)"], hint: "More than two options.", why: "ELIF handles multiple different conditions." },
    { q: "What is 'Modular Programming'?", a: "Breaking a programme into smaller, independent subroutines", options: ["Breaking a programme into smaller, independent subroutines", "Writing all code in a single, long sequence", "Using only hardware components for calculation", "Encrypting code so users cannot read it"], hint: "Subroutines.", why: "Modular programming uses decomposition to improve structure." },
    { q: "What are the three basic programming constructs?", a: "Sequence, selection and iteration", options: ["Sequence, selection and iteration", "Input, process and output", "Variables, constants and arrays", "Compile, run and debug"], hint: "Order, choice, repetition.", why: "Every program is built from these three in combination." },
    { q: "Which construct repeats code a set number of times?", a: "A FOR loop", options: ["A FOR loop", "A WHILE loop", "An IF statement", "A subroutine call"], hint: "Count-controlled.", why: "A FOR loop runs once per value in a known range." },
    { q: "When is a WHILE loop the right choice?", a: "When you do not know in advance how many repeats are needed", options: ["When you do not know in advance how many repeats are needed", "When you must repeat exactly ten times", "When no repetition is needed at all", "When the code must run once only"], hint: "Condition-controlled.", why: "Validation loops repeat until the input is acceptable, however long that takes." },
    { q: "What is 'nested' selection?", a: "An IF statement placed inside another IF statement", options: ["An IF statement placed inside another IF statement", "Two IF statements written side by side", "An IF statement inside a subroutine", "A loop placed inside an IF statement"], hint: "One inside the other.", why: "Nesting lets a second condition be tested only when the first was true." },
    { q: "What does ELSE do in a selection statement?", a: "Runs when the condition was false", options: ["Runs when the condition was false", "Runs when the condition was true", "Always runs regardless of the condition", "Ends the program immediately"], hint: "The other path.", why: "ELSE catches every case the earlier conditions did not." },
    { q: "How many times does 'FOR i ← 1 TO 5' run its body?", a: "5", options: ["5", "4", "6", "1"], hint: "Inclusive at both ends.", why: "i takes the values 1, 2, 3, 4 and 5, giving five iterations." },
    { q: "What is an infinite loop?", a: "A loop whose condition never becomes false", options: ["A loop whose condition never becomes false", "A loop that runs exactly once", "A loop containing a syntax error", "A loop with no statements inside it"], hint: "It never stops.", why: "If nothing inside the loop changes the condition, it repeats forever." },
    { q: "What does ELIF (ELSE IF) allow?", a: "Testing a further condition when the first was false", options: ["Testing a further condition when the first was false", "Repeating a block until a condition is true", "Declaring a variable inside a loop", "Ending a subroutine early"], hint: "Another chance to match.", why: "ELIF chains let one branch out of many run, without deep nesting." },
    { q: "Which loop always runs its body at least once?", a: "A REPEAT UNTIL loop", options: ["A REPEAT UNTIL loop", "A WHILE loop", "A FOR loop with a range of zero", "None of them"], hint: "Condition tested at the end.", why: "REPEAT UNTIL checks the condition after running, so the body always executes once." },
    { q: "What is 'sequence' in programming?", a: "Instructions carried out one after another in order", options: ["Instructions carried out one after another in order", "Choosing between two blocks of code", "Repeating a block of code", "Calling a block of code by name"], hint: "Top to bottom.", why: "Order matters: swapping two lines can change the result entirely." },
    { q: "Why must a WHILE loop's condition eventually become false?", a: "Otherwise the program will never move past the loop", options: ["Otherwise the program will never move past the loop", "Otherwise the loop will not run at all", "Otherwise the variable will lose its value", "Otherwise the compiler reports a syntax error"], hint: "Something must change.", why: "A counter or a fresh input inside the loop is what lets it terminate." },
    { q: "What runs if no condition in an IF/ELIF chain is true and there is no ELSE?", a: "Nothing from the chain runs", options: ["Nothing from the chain runs", "The first branch runs by default", "The last branch runs by default", "The program stops with an error"], hint: "No match, no action.", why: "Execution simply continues after the chain." },
    { q: "In 'FOR i ← 0 TO 3', what is i during the final iteration?", a: "3", options: ["3", "4", "0", "2"], hint: "It stops at the upper bound.", why: "The loop counts 0, 1, 2, 3 then ends." },
    { q: "What is a nested loop?", a: "A loop written inside another loop", options: ["A loop written inside another loop", "A loop that calls a subroutine", "A loop with two conditions", "A loop that never terminates"], hint: "Loop within a loop.", why: "Nested loops are how you walk every cell of a 2D structure." },
    { q: "Which construct would you use to keep asking until a password is right?", a: "A WHILE loop", options: ["A WHILE loop", "A FOR loop", "A single IF statement", "A subroutine"], hint: "Unknown number of attempts.", why: "You cannot know how many guesses the user needs, so the loop is condition-controlled." }
  ],
  "3.2.3 Arithmetic Operations": [
    { q: "Which symbol is used for Division in most languages?", a: "/ (forward slash for real division)", options: ["/ (forward slash for real division)", "\\ (backslash for integer division)", "% (percent for remainder division)", "DIV (command for quotient division)"], hint: "Forward slash.", why: "The forward slash is the standard operator for real division." },
    { q: "What does the MOD (%) operator do?", a: "Calculates the remainder of a division operation", options: ["Calculates the remainder of a division operation", "Multiplies a value by 100 for percentage", "Deletes a variable from the system memory", "Adds two whole numbers together in sequence"], hint: "10 MOD 3 is 1.", why: "Modulus returns the remainder of a division." },
    { q: "What does the DIV (//) operator do?", a: "Calculates the quotient (integer division)", options: ["Calculates the quotient (integer division)", "Calculates the remainder of the division", "Squares a numerical value automatically", "Adds text strings together in a sequence"], hint: "10 DIV 3 is 3.", why: "DIV returns the whole number of times a value goes into another." },
    { q: "What is 7 MOD 2?", a: "1 (the remainder after division)", options: ["1 (the remainder after division)", "3 (the whole number quotient)", "3.5 (the exact decimal result)", "0 (as it divides into the number)"], hint: "Remainder of 7 divided by 2.", why: "2 goes into 7 three times with 1 left over." },
    { q: "What is 7 DIV 2?", a: "3 (the integer quotient result)", options: ["3 (the integer quotient result)", "1 (the remainder result)", "3.5 (the real division result)", "4 (the rounded up result)"], hint: "Whole number only.", why: "Integer division discards the fractional remainder." },
    { q: "The symbol '**' or '^' usually means?", a: "Exponentiation (raising to a power)", options: ["Exponentiation (raising to a power)", "Multiplication of two separate values", "Division of a value into equal parts", "Modulus to find a division remainder"], hint: "3 ** 2 is 9.", why: "These symbols are used to raise a number to a power." },
    { q: "What is the result of 10 + 5 * 2?", a: "20 (due to BIDMAS/Order of Operations)", options: ["20 (due to BIDMAS/Order of Operations)", "30 (calculated from left to right)", "15 (calculated by adding first)", "10 (calculated by subtracting last)"], hint: "Order of operations (BIDMAS).", why: "Multiplication happens before addition." },
    { q: "Which operator has the lowest priority in BIDMAS?", a: "Addition / Subtraction", options: ["Addition / Subtraction", "Multiplication / Division", "Brackets / Parentheses", "Exponents / Indices"], hint: "BIDMAS.", why: "Addition and Subtraction are performed last." },
    { q: "What is the symbol for Multiplication?", a: "* (asterisk symbol)", options: ["* (asterisk symbol)", "x (lowercase x symbol)", "X (uppercase X symbol)", "MULT (command keyword)"], hint: "The asterisk.", why: "Programming languages use the asterisk for multiplication." },
    { q: "What is 15 MOD 5?", a: "0 (as there is no remainder)", options: ["0 (as there is no remainder)", "3 (as it divides three times)", "1 (as a standard remainder)", "5 (as the divisor used)"], hint: "Does it divide exactly?", why: "There is no remainder when 15 is divided by 5." },
    { q: "How do you check if a number is Even?", a: "Check if (Number MOD 2) equals 0", options: ["Check if (Number MOD 2) equals 0", "Check if (Number DIV 2) equals 1", "Check if (Number + 2) equals 4", "Check if (Number * 2) equals 10"], hint: "Remainder should be 0.", why: "If a number MOD 2 equals 0, it is even." },
    { q: "What is the result of 16 DIV 5?", a: "3 (the whole number quotient)", options: ["3 (the whole number quotient)", "1 (the remaining remainder)", "3.2 (the exact decimal value)", "0 (the integer failure)"], hint: "Whole numbers only.", why: "5 goes into 16 three times; the remainder is ignored." },
    { q: "In 10 / 4, what is the result using Real division?", a: "2.5 (the exact fractional value)", options: ["2.5 (the exact fractional value)", "2 (the integer quotient value)", "0.5 (the remainder fraction)", "10 (the numerator value)"], hint: "Decimals included.", why: "Real division calculates the exact fractional value." },
    { q: "Why are brackets used in mathematical expressions?", a: "To prioritise specific parts of the calculation", options: ["To prioritise specific parts of the calculation", "To save memory space during execution", "To make the code look more attractive", "To define a new local variable name"], hint: "BIDMAS.", why: "Brackets have the highest priority." },
    { q: "What is the result of 2 ** 3?", a: "8 (calculated as 2 x 2 x 2)", options: ["8 (calculated as 2 x 2 x 2)", "6 (calculated as 2 x 3)", "9 (calculated as 3 x 3)", "4 (calculated as 2 x 2)"], hint: "2 x 2 x 2.", why: "2 raised to the power of 3 is 8." },
    { q: "What does the MOD operator return?", a: "The remainder after division", options: ["The remainder after division", "The whole-number part of a division", "The result of a multiplication", "The larger of two numbers"], hint: "What is left over.", why: "17 MOD 5 is 2 because 5 goes into 17 three times with 2 remaining." },
    { q: "What is 17 DIV 5?", a: "3", options: ["3", "2", "3.4", "4"], hint: "Whole part only.", why: "Integer division discards the remainder, giving 3." },
    { q: "How can you test whether a number is even?", a: "Check whether number MOD 2 equals 0", options: ["Check whether number MOD 2 equals 0", "Check whether number DIV 2 equals 0", "Check whether number * 2 equals 0", "Check whether number - 2 equals 0"], hint: "No remainder.", why: "Even numbers divide by two exactly, so the remainder is zero." },
    { q: "What is 7 / 2 in a language that uses real division?", a: "3.5", options: ["3.5", "3", "4", "1"], hint: "Keep the fraction.", why: "Real division preserves the decimal part, unlike DIV." },
    { q: "What is 23 MOD 10?", a: "3", options: ["3", "2", "20", "0"], hint: "The units digit.", why: "MOD 10 extracts the last digit of a whole number." },
    { q: "How do you get the tens digit of a two-digit number n?", a: "n DIV 10", options: ["n DIV 10", "n MOD 10", "n / 10", "n * 10"], hint: "Throw away the units.", why: "Integer division by ten shifts the digits right, leaving the tens digit." },
    { q: "What is the result of 2 * 3 + 4?", a: "10", options: ["10", "14", "24", "9"], hint: "Multiplication binds tighter.", why: "Multiplication happens before addition, so it is 6 + 4." },
    { q: "What does 2 ^ 3 (exponentiation) give?", a: "8", options: ["8", "6", "9", "5"], hint: "Two cubed.", why: "Exponentiation raises 2 to the power 3, which is 2 x 2 x 2." },
    { q: "Which operator would you use to split seconds into whole minutes?", a: "DIV", options: ["DIV", "MOD", "*", "^"], hint: "How many whole minutes fit.", why: "seconds DIV 60 gives complete minutes; MOD 60 gives leftover seconds." },
    { q: "What is 5 MOD 5?", a: "0", options: ["0", "1", "5", "An error"], hint: "It divides exactly.", why: "Five goes into five once with nothing left over." },
    { q: "Why do brackets matter in (2 + 3) * 4?", a: "They force the addition to happen first", options: ["They force the addition to happen first", "They convert the result to an integer", "They are only for readability", "They repeat the calculation twice"], hint: "Brackets outrank everything.", why: "Without them the answer would be 14 instead of 20." },
    { q: "What is 9 DIV 4 followed by 9 MOD 4?", a: "2 and 1", options: ["2 and 1", "1 and 2", "2 and 2", "4 and 1"], hint: "Quotient then remainder.", why: "Four fits into nine twice with one left over." },
    { q: "Which calculation converts pence to whole pounds?", a: "pence DIV 100", options: ["pence DIV 100", "pence MOD 100", "pence * 100", "pence + 100"], hint: "How many whole hundreds.", why: "Integer division gives complete pounds; MOD 100 gives the remaining pence." },
    { q: "What is -7 DIV 2 likely to be in a language that truncates?", a: "-3", options: ["-3", "-4", "-3.5", "3"], hint: "Chop toward zero.", why: "Truncation removes the fraction, though some languages round down instead." },
    { q: "Why is MOD useful when generating a repeating pattern?", a: "It cycles values back round to zero", options: ["It cycles values back round to zero", "It always returns a negative number", "It doubles the value each time", "It converts numbers into strings"], hint: "Wrap around.", why: "i MOD 7 cycles 0-6 repeatedly, which is how days of the week can be indexed." }
  ],
  "3.2.4 Relational Operations": [
    { q: "Which symbol means 'Greater than or equal to'?", a: ">= (arrow pointing right and equals)", options: [">= (arrow pointing right and equals)", "=> (equals and arrow pointing right)", "> (arrow pointing right only)", "== (double equals for equality)"], hint: "Arrow and equals.", why: ">= checks if a value is larger than or exactly equal to another." },
    { q: "What does '==' represent in programming?", a: "Equal to (comparison operator)", options: ["Equal to (comparison operator)", "Assignment (setting a value)", "Not equal (inequality operator)", "Less than (smaller than operator)"], hint: "Comparison, not assignment.", why: "Double equals is used to compare two values for equality." },
    { q: "What does '!=' represent in programming?", a: "Not equal to (inequality operator)", options: ["Not equal to (inequality operator)", "Equal to (equality operator)", "Exclamation (logical inversion)", "Does not exist (null operator)"], hint: "Inequality.", why: "The exclamation mark often represents 'NOT' in programming." },
    { q: "What is the result of the expression (5 > 3)?", a: "True (as a boolean value)", options: ["True (as a boolean value)", "False (as a boolean value)", "8 (as an integer sum)", "2 (as an integer difference)"], hint: "Is 5 bigger than 3?", why: "The relational operation returns a Boolean value." },
    { q: "What is the result of the expression (10 < 10)?", a: "False (as they are equal values)", options: ["False (as they are equal values)", "True (as they are identical values)", "0 (as a numerical result)", "Error (as a logic failure)"], hint: "Is it strictly smaller?", why: "10 is equal to 10, so it is not less than 10." },
    { q: "Which symbol is 'Less than or equal to'?", a: "<= (arrow pointing left and equals)", options: ["<= (arrow pointing left and equals)", "=< (equals and arrow pointing left)", "< (arrow pointing left only)", "!= (not equal to operator)"], hint: "Arrow and equals.", why: "<= checks if the first value is smaller or equal to the second." },
    { q: "Relational operators always return which data type?", a: "Boolean (True or False)", options: ["Boolean (True or False)", "Integer (Whole numbers)", "String (Sequence of text)", "Real (Decimal numbers)"], hint: "True or False.", why: "Comparisons result in a logical true or false." },
    { q: "If x = 5, what is the result of (x != 5)?", a: "False (because x is equal to 5)", options: ["False (because x is equal to 5)", "True (because x is a variable)", "5 (the value of the variable)", "Error (invalid comparison)"], hint: "Is 5 NOT equal to 5?", why: "Since x is 5, the statement 'not equal to 5' is false." },
    { q: "Comparing 'apple' to 'Apple' is usually?", a: "False (due to case sensitivity)", options: ["False (due to case sensitivity)", "True (due to matching letters)", "Error (due to string comparison)", "Null (due to empty result)"], hint: "Case sensitivity.", why: "Most languages treat capital letters as different values from lowercase." },
    { q: "Which operator checks for inequality?", a: "!= (not equal operator)", options: ["!= (not equal operator)", "== (equal operator)", "<> (alternate inequality)", "Both != and <>"], hint: "Depends on language, but usually !=.", why: "!= is the standard 'Not Equal' operator." },
    { q: "Is (15 >= 15) True or False?", a: "True (it satisfies the 'equal' part)", options: ["True (it satisfies the 'equal' part)", "False (it must be strictly greater)"], hint: "It checks 'or equal'.", why: "Because 15 equals 15, the condition is satisfied." },
    { q: "Which of these is a Relational Operator?", a: "== (equality check)", options: ["== (equality check)", "+ (addition operator)", "MOD (remainder operator)", "PRINT (output command)"], hint: "Used in an IF statement.", why: "Relational operators compare two values." },
    { q: "In 'IF score > 50', what is the relational operator?", a: "> (greater than symbol)", options: ["> (greater than symbol)", "IF (selection keyword)", "score (variable name)", "50 (integer literal)"], hint: "The comparison symbol.", why: "The greater-than symbol compares the variable to the value." },
    { q: "Is (0 == False) in many languages?", a: "True (binary 0 represents False)", options: ["True (binary 0 represents False)", "False (they are different types)"], hint: "Binary logic.", why: "In many languages, 0 is used for False and 1 for True." },
    { q: "Relational operators are most commonly used in?", a: "Selection and Iteration structures", options: ["Selection and Iteration structures", "Variable and constant naming", "Printing and displaying text", "Inputting and receiving data"], hint: "Decisions and loops.", why: "They provide the conditions that control programme flow." },
    { q: "What does the != operator test?", a: "Whether two values are not equal", options: ["Whether two values are not equal", "Whether two values are equal", "Whether a value is negative", "Whether a value is a string"], hint: "Not equal.", why: "It returns True whenever the two operands differ." },
    { q: "What does a relational operator always produce?", a: "A Boolean value", options: ["A Boolean value", "An integer", "A string", "A real number"], hint: "True or False.", why: "Comparisons answer a yes/no question, which is why they drive IF statements." },
    { q: "Which operator means 'greater than or equal to'?", a: ">=", options: [">=", "<=", "==", "=>"], hint: "Greater sign first.", why: "It is True when the left value is larger or the two are the same." },
    { q: "What is the difference between = and == in most languages?", a: "= assigns a value, == compares two values", options: ["= assigns a value, == compares two values", "== assigns a value, = compares two values", "They mean exactly the same thing", "= is for numbers, == is for strings"], hint: "Store versus check.", why: "Using = inside an IF is a classic error the interpreter may reject." },
    { q: "Is 'Apple' == 'apple' True?", a: "No, comparisons are usually case sensitive", options: ["No, comparisons are usually case sensitive", "Yes, case is always ignored", "Only if both are converted to integers", "Only in a WHILE loop"], hint: "Capitals differ.", why: "'A' and 'a' have different character codes, so the strings are not equal." },
    { q: "What does 5 <= 5 evaluate to?", a: "True", options: ["True", "False", "5", "An error"], hint: "Or equal to.", why: "The 'or equal to' half of the operator is satisfied." },
    { q: "Which comparison would find pupils younger than 16?", a: "age < 16", options: ["age < 16", "age > 16", "age <= 16", "age != 16"], hint: "Strictly less.", why: "Using <= would wrongly include pupils who are exactly 16." },
    { q: "How are strings compared alphabetically?", a: "Character by character using their character codes", options: ["Character by character using their character codes", "By comparing their total lengths", "By comparing the number of vowels", "Strings cannot be compared"], hint: "Letter by letter.", why: "The first differing character decides the order, which is how sorting words works." },
    { q: "What does the condition 'score > 0 AND score < 100' test?", a: "That score lies strictly between 0 and 100", options: ["That score lies strictly between 0 and 100", "That score is either 0 or 100", "That score is outside the range 0 to 100", "That score is exactly 50"], hint: "Both must hold.", why: "AND requires both comparisons to be True at once." },
    { q: "Why is 'x = 5' inside an IF statement a common bug?", a: "It assigns instead of comparing", options: ["It assigns instead of comparing", "It compares instead of assigning", "It always evaluates to False", "It creates an infinite loop"], hint: "One equals sign.", why: "The intended test was x == 5; the single sign overwrites the variable." },
    { q: "What is the result of 10 != 10?", a: "False", options: ["False", "True", "10", "0"], hint: "They are equal.", why: "'Not equal' is False when the values match." },
    { q: "Which operator checks that two values are exactly the same?", a: "==", options: ["==", "=", "!=", "<="], hint: "Double equals.", why: "A single equals is assignment in most languages." },
    { q: "How would you test that a value is NOT between 1 and 10?", a: "value < 1 OR value > 10", options: ["value < 1 OR value > 10", "value < 1 AND value > 10", "value > 1 OR value < 10", "NOT value == 1"], hint: "Outside on either side.", why: "AND would be impossible to satisfy since no number is both below 1 and above 10." },
    { q: "What does 'b' < 'a' evaluate to?", a: "False", options: ["False", "True", "0", "An error"], hint: "Compare the codes.", why: "'b' has a higher character code than 'a', so it is not less than it." },
    { q: "Which comparison correctly finds a pass mark of 40 or more?", a: "mark >= 40", options: ["mark >= 40", "mark > 40", "mark <= 40", "mark == 40"], hint: "Include the boundary.", why: "Using > would fail a candidate who scored exactly the pass mark." }
  ],
  "3.2.5 Boolean Operations": [
    { q: "Which Boolean operator requires BOTH conditions to be True?", a: "AND (logical conjunction)", options: ["AND (logical conjunction)", "OR (logical disjunction)", "NOT (logical negation)", "XOR (exclusive disjunction)"], hint: "Strict requirement.", why: "AND only returns True if every input is True." },
    { q: "Which operator requires only ONE condition to be True?", a: "OR (logical disjunction)", options: ["OR (logical disjunction)", "AND (logical conjunction)", "NOT (logical negation)", "NAND (negated conjunction)"], hint: "Either/Or.", why: "OR returns True if at least one input is True." },
    { q: "Which operator reverses the current Boolean value?", a: "NOT (logical negation)", options: ["NOT (logical negation)", "AND (logical conjunction)", "OR (logical disjunction)", "IF (selection structure)"], hint: "Inverse.", why: "NOT turns True into False and vice versa." },
    { q: "What is the result of (True AND False)?", a: "False (as one input is false)", options: ["False (as one input is false)", "True (as one input is true)", "Error (as incompatible types)", "Null (as an empty result)"], hint: "Are both True?", why: "Because one is False, the AND operation fails." },
    { q: "What is the result of (True OR False)?", a: "True (as one input is true)", options: ["True (as one input is true)", "False (as one input is false)", "Error (as incompatible types)", "Null (as an empty result)"], hint: "Is at least one True?", why: "Because the first value is True, the OR operation succeeds." },
    { q: "What is the result of (NOT True)?", a: "False (the inverted logical state)", options: ["False (the inverted logical state)", "True (the original logical state)", "0 (as a numerical zero)", "1 (as a numerical one)"], hint: "The opposite.", why: "NOT inverts the Boolean value." },
    { q: "Which gate is shown by a triangle with a dot in logic diagrams?", a: "NOT gate (the logical inverter)", options: ["NOT gate (the logical inverter)", "AND gate (the logical conjunction)", "OR gate (the logical disjunction)", "XOR gate (the exclusive or)"], hint: "A single input gate.", why: "The triangle with a circle (inverter) is the NOT gate." },
    { q: "Which logic gate is shaped like a 'D'?", a: "AND gate (logical conjunction)", options: ["AND gate (logical conjunction)", "OR gate (logical disjunction)", "NOT gate (logical negation)", "NAND gate (negated and)"], hint: "Logic gate shapes.", why: "The AND gate has a flat back and a rounded front." },
    { q: "Which gate is shaped like a curved shield or rocket?", a: "OR gate (logical disjunction)", options: ["OR gate (logical disjunction)", "AND gate (logical conjunction)", "NOT gate (logical negation)", "XOR gate (exclusive or)"], hint: "Logic gate shapes.", why: "The OR gate has a curved input side and a pointed output." },
    { q: "What is the result of (False OR False)?", a: "False (as no inputs are true)", options: ["False (as no inputs are true)", "True (as it matches types)", "Error (as invalid logic)", "0 (as a numerical result)"], hint: "Are any of them True?", why: "Since neither is True, the OR operation results in False." },
    { q: "What is the result of (NOT False)?", a: "True (the inverted logical state)", options: ["True (the inverted logical state)", "False (the original state)", "1 (as a numerical one)", "0 (as a numerical zero)"], hint: "Opposite of False.", why: "The inverse of False is True." },
    { q: "What is (5 > 2 AND 10 < 20)?", a: "True (both conditions are met)", options: ["True (both conditions are met)", "False (one condition failed)", "Error (invalid comparison)", "8 (numerical remainder)"], hint: "Are both sides True?", why: "Both 5>2 and 10<20 are true, so AND is true." },
    { q: "What is (False AND True)?", a: "False (requires both to be true)", options: ["False (requires both to be true)", "True (as one is true)", "0 (numerical failure)", "1 (numerical success)"], hint: "Both must be true.", why: "One is false, so the whole expression is false." },
    { q: "A 'Truth Table' shows...?", a: "All possible outputs for given inputs", options: ["All possible outputs for given inputs", "The identity of the coder", "A list of all syntax errors", "Physical memory addresses"], hint: "Binary combinations.", why: "Truth tables map out every logical outcome." },
    { q: "How many inputs does a standard NOT gate have?", a: "1 (it is a unary operator)", options: ["1 (it is a unary operator)", "2 (it requires comparison)", "3 (it requires validation)", "Unlimited (it is flexible)"], hint: "It only flips one value.", why: "NOT is a unary operator, taking only one input." },
    { q: "What does the AND operator return when both inputs are True?", a: "True", options: ["True", "False", "Either value", "An error"], hint: "Both must hold.", why: "AND is only True when every input is True." },
    { q: "What does OR return when both inputs are False?", a: "False", options: ["False", "True", "Either value", "An error"], hint: "At least one needed.", why: "OR is False only when no input is True." },
    { q: "What does NOT do?", a: "Reverses a Boolean value", options: ["Reverses a Boolean value", "Combines two Boolean values", "Compares two numbers", "Repeats a block of code"], hint: "Flip it.", why: "NOT True is False and NOT False is True." },
    { q: "How many rows does a truth table with 3 inputs have?", a: "8", options: ["8", "6", "3", "9"], hint: "Two to the power of the inputs.", why: "Each input doubles the combinations, so 2 x 2 x 2 is 8." },
    { q: "What is NOT (True AND False)?", a: "True", options: ["True", "False", "An error", "Either value"], hint: "Work inside out.", why: "True AND False is False, and NOT False is True." },
    { q: "Which expression is True only when both conditions fail?", a: "NOT a AND NOT b", options: ["NOT a AND NOT b", "a AND b", "a OR b", "NOT (a AND b)"], hint: "Neither one.", why: "Both must be individually false for the whole expression to be true." },
    { q: "Why is 'if colour == \"red\" or \"blue\"' a bug in Python?", a: "The string 'blue' on its own is always treated as True", options: ["The string 'blue' on its own is always treated as True", "OR cannot be used with strings", "It compares the wrong variable", "It needs square brackets instead"], hint: "Name the variable twice.", why: "It must read colour == 'red' or colour == 'blue'." },
    { q: "What is True OR False?", a: "True", options: ["True", "False", "An error", "Neither"], hint: "One is enough.", why: "OR needs only a single True input." },
    { q: "In Boolean algebra notation, what does A.B mean?", a: "A AND B", options: ["A AND B", "A OR B", "NOT A", "A XOR B"], hint: "A dot is a product.", why: "The dot is the AND operator, like multiplication." },
    { q: "In Boolean algebra notation, what does A+B mean?", a: "A OR B", options: ["A OR B", "A AND B", "NOT A", "A plus B numerically"], hint: "A plus is a sum.", why: "The plus sign is the OR operator, not arithmetic addition." },
    { q: "What is the output of Q = A AND NOT B when A=1 and B=0?", a: "1", options: ["1", "0", "Either", "Undefined"], hint: "NOT 0 is 1.", why: "NOT B gives 1, and 1 AND 1 gives 1." },
    { q: "Which condition allows entry when a pupil has a pass AND a permit?", a: "pass == True AND permit == True", options: ["pass == True AND permit == True", "pass == True OR permit == True", "NOT pass AND NOT permit", "pass != permit"], hint: "Both required.", why: "AND enforces that neither requirement can be skipped." },
    { q: "What does A OR NOT A always equal?", a: "True", options: ["True", "False", "A", "NOT A"], hint: "One of them must hold.", why: "Whatever A is, either A or its opposite is True." },
    { q: "What does A AND NOT A always equal?", a: "False", options: ["False", "True", "A", "NOT A"], hint: "They cannot both hold.", why: "A value cannot be both True and False at once." },
    { q: "How many rows does a 2-input truth table need?", a: "4", options: ["4", "2", "6", "8"], hint: "Two squared.", why: "The combinations are 00, 01, 10 and 11." }
  ],
  "3.2.6 Data Structures": [
    { q: "What is an 'Array'?", a: "A collection of data items under one name", options: ["A collection of data items under one name", "A single variable used once", "A type of iteration structure", "A physical hardware component"], hint: "Stores lists.", why: "Arrays store multiple pieces of data that can be indexed." },
    { q: "What is an 'Index' in an array?", a: "The numerical position of an item in a list", options: ["The numerical position of an item in a list", "The unique name of the entire array", "The total size of the array structure", "The specific data type of the items"], hint: "Usually starts at 0.", why: "Indices are used to access specific elements in an array." },
    { q: "What is the first index in most languages?", a: "0 (zero-based indexing)", options: ["0 (zero-based indexing)", "1 (one-based indexing)", "-1 (negative indexing)", "10 (fixed indexing)"], hint: "Start counting from zero.", why: "Computer science typically uses zero-based indexing." },
    { q: "What is a '2D Array'?", a: "An array that contains other arrays", options: ["An array that contains other arrays", "A very large single array", "An array with two different names", "An array designed for 3D tasks"], hint: "Like a grid.", why: "2D arrays use two indices (rows and columns) to locate data." },
    { q: "Accessing 3rd item in 'Scores' array?", a: "Scores[2] (due to zero-indexing)", options: ["Scores[2] (due to zero-indexing)", "Scores[3] (direct positioning)", "Scores[1] (preceding position)", "Scores[4] (extended position)"], hint: "Start at 0.", why: "Index 0 is 1st, 1 is 2nd, 2 is 3rd." },
    { q: "What is a 'Record' in data structures?", a: "A group of related fields about one entity", options: ["A group of related fields about one entity", "A fast computer used for data", "A type of iteration loop", "A file saved to the system"], hint: "Like a database row.", why: "Records group different data types belonging to one item." },
    { q: "What is a 'Field'?", a: "A single piece of data within a record", options: ["A single piece of data within a record", "The entire record collection", "A specific type of 1D array", "The name of a local variable"], hint: "A column.", why: "Fields are the components that make up a record." },
    { q: "Why are arrays useful for iteration?", a: "You can use a loop to process every item", options: ["You can use a loop to process every item", "They make loop execution faster", "They eliminate the need for loops", "They delete data after the loop"], hint: "Going through a list.", why: "Loops use index variables to access each element in turn." },
    { q: "What is the 'Length' of an array?", a: "The total number of items it contains", options: ["The total number of items it contains", "The amount of memory used", "The unique name of the array", "The highest index value used"], hint: "Count the items.", why: "Length tells you the total number of elements." },
    { q: "A 'Static' data structure...?", a: "Has a fixed size defined at start", options: ["Has a fixed size defined at start", "Never changes its stored data", "Is saved to the system disk", "Is deleted quickly after use"], hint: "Fixed length.", why: "Static structures cannot grow or shrink during runtime." },
    { q: "A 'Dynamic' data structure...?", a: "Can change its size during programme runtime", options: ["Can change its size during programme runtime", "Is designed only for animation", "Only stores numerical data types", "Remains the same size always"], hint: "Can expand.", why: "Dynamic structures adjust memory based on data stored." },
    { q: "What is a 'Linked List'?", a: "Data items that point to the next node", options: ["Data items that point to the next node", "Variables that share a single name", "A hardware connection between PCs", "A link to an external website"], hint: "Nodes and pointers.", why: "Linked lists connect data in different memory locations." },
    { q: "In grid[row][col], what is grid[0][1]?", a: "The first row and second column", options: ["The first row and second column", "The second row and first column", "The first row and first column", "The second row and second column"], hint: "Row first, then column.", why: "Index 0 is first, index 1 is second." },
    { q: "Best structure for a simple shopping list?", a: "1D Array or List (single column)", options: ["1D Array or List (single column)", "2D Array (grid based data)", "Record (mixed field entity)", "Boolean (logical binary states)"], hint: "Single column.", why: "A 1D array is the simplest way to store a sequence." },
    { q: "What is the behaviour of a Stack?", a: "Last-In, First-Out (LIFO structure)", options: ["Last-In, First-Out (LIFO structure)", "First-In, First-Out (FIFO structure)", "Random-Access (non-linear structure)", "Never-In (empty data structure)"], hint: "Stack of plates.", why: "Stacks only allow adding/removing from the top." },
    { q: "What is a two-dimensional array best suited to?", a: "Storing data arranged in rows and columns", options: ["Storing data arranged in rows and columns", "Storing exactly two values", "Storing values of two different types", "Storing data twice for backup"], hint: "A grid.", why: "Seating plans, game boards and spreadsheets are all naturally 2D." },
    { q: "How do you access the item in row 2, column 1 of a 2D list?", a: "grid[2][1]", options: ["grid[2][1]", "grid[1][2]", "grid(2,1)", "grid.2.1"], hint: "Row first, then column.", why: "The first index selects the row, the second the item within it." },
    { q: "In programming, what is a record?", a: "A structure holding related fields of different types", options: ["A structure holding related fields of different types", "A list of items all of the same type", "A single value stored in memory", "A loop that repeats a fixed number of times"], hint: "One row of a table.", why: "A pupil record might hold a name (string), age (integer) and average (real)." },
    { q: "What is the length of the list [4, 8, 15, 16]?", a: "4", options: ["4", "3", "5", "16"], hint: "Count the items.", why: "Length counts items, while the last index is one lower at 3." },
    { q: "Why must you not access index 5 of a 5-item list?", a: "Valid indexes run 0 to 4, so 5 is out of bounds", options: ["Valid indexes run 0 to 4, so 5 is out of bounds", "Index 5 always holds an empty value", "Lists can only hold four items", "The list must be sorted first"], hint: "Zero-indexed.", why: "Going past the end raises an index out of range error." },
    { q: "What does appending to a list do?", a: "Adds a new item to the end", options: ["Adds a new item to the end", "Inserts an item at the start", "Removes the last item", "Sorts the list"], hint: "Push on the end.", why: "Append grows a dynamic list by one item." },
    { q: "What is the difference between a static and a dynamic data structure?", a: "A static one has a fixed size; a dynamic one can grow", options: ["A static one has a fixed size; a dynamic one can grow", "A static one holds numbers only", "A dynamic one cannot be searched", "A static one is stored on disk"], hint: "Can it resize?", why: "Static structures reserve memory up front; dynamic ones adjust at run time." },
    { q: "How many items does a 3 x 4 two-dimensional array hold?", a: "12", options: ["12", "7", "3", "4"], hint: "Multiply the dimensions.", why: "Three rows of four items each gives twelve cells." },
    { q: "Which loop structure walks every cell of a 2D array?", a: "A nested loop", options: ["A nested loop", "A single WHILE loop", "A REPEAT UNTIL loop", "No loop is needed"], hint: "Rows then columns.", why: "The outer loop selects the row and the inner loop walks along it." },
    { q: "What is an advantage of an array over separate variables?", a: "Items can be processed with a loop", options: ["Items can be processed with a loop", "Each item can hold a different data type", "It uses no memory", "Values cannot be changed by mistake"], hint: "Index it in a loop.", why: "One loop handles 1,000 items; 1,000 named variables would need 1,000 lines." },
    { q: "What does list[0] refer to?", a: "The first item", options: ["The first item", "The last item", "The number of items", "An empty slot"], hint: "Counting starts at zero.", why: "Zero-based indexing is standard in Python and most other languages." },
    { q: "Which is the best structure for a class register of names?", a: "A one-dimensional array of strings", options: ["A one-dimensional array of strings", "A single string variable", "A Boolean variable", "A 2D array of integers"], hint: "A simple list.", why: "One name per element lets you loop, search and sort easily." },
    { q: "What happens to later items when you insert at the start of a list?", a: "They shift up by one index", options: ["They shift up by one index", "They are deleted", "They stay at the same index", "They are copied to a new list"], hint: "Everything moves along.", why: "Inserting at the front is costly because every other item must move." },
    { q: "How would you total every value in an array?", a: "Loop through, adding each item to a running total", options: ["Loop through, adding each item to a running total", "Print the array and read the numbers", "Sort the array and take the last item", "Use the array's length as the total"], hint: "Accumulate.", why: "A total variable starting at 0 accumulates each element in turn." },
    { q: "In a 2D array of exam marks, what might a whole row represent?", a: "All the marks for one pupil", options: ["All the marks for one pupil", "All the marks for one subject", "The class average", "The number of pupils"], hint: "Rows group related values.", why: "Rows commonly hold one entity's data, with columns as the fields." }
  ],
  "3.2.7 Input and Output": [
    { q: "Which command takes data from a user?", a: "input() (standard input function)", options: ["input() (standard input function)", "print() (standard output function)", "output() (hypothetical command)", "get() (alternate retrieval method)"], hint: "Keyboard entry.", why: "The input command pauses the programme to wait for the user." },
    { q: "Which command displays data on the screen?", a: "print() (standard output function)", options: ["print() (standard output function)", "input() (standard input function)", "write() (file writing command)", "show() (visual display command)"], hint: "Standard output.", why: "Print sends data to the monitor for the user to see." },
    { q: "User input is usually received as which type?", a: "String (requiring casting for math)", options: ["String (requiring casting for math)", "Integer (whole numerical value)", "Real (decimal numerical value)", "Boolean (logical binary value)"], hint: "Needs casting for math.", why: "Computers treat keyboard input as characters by default." },
    { q: "How do you output 'Hello World' in Python?", a: "print('Hello World') (with quotes)", options: ["print('Hello World') (with quotes)", "input('Hello World') (as a prompt)", "echo 'Hello World' (console command)", "console.log('Hello World') (JS)"], hint: "Standard command.", why: "Python uses the print function with parentheses." },
    { q: "What is a 'Prompt' in I/O?", a: "A message telling the user what to enter", options: ["A message telling the user what to enter", "A type of high-speed variable", "The internal clock speed of a CPU", "A specific type of syntax error"], hint: "Example: 'Enter your age'.", why: "Prompts guide the user on what data is required." },
    { q: "Which command would you use to show variable 'x'?", a: "print(x) (using the variable name)", options: ["print(x) (using the variable name)", "print('x') (printing the literal letter)", "input(x) (requesting x from user)", "show(x) (displaying the variable)"], hint: "No quotes for variables.", why: "Using quotes would print the letter 'x' instead of its value." },
    { q: "Why is 'Validation' used on user inputs?", a: "To ensure data is sensible and correct", options: ["To ensure data is sensible and correct", "To make the code execute faster", "To save battery power on devices", "To encrypt data for secure storage"], hint: "Checking for errors.", why: "Validation prevents programme crashes due to bad data." },
    { q: "A 'Type Check' validation ensures?", a: "The correct data type was provided", options: ["The correct data type was provided", "The input field was not left blank", "The data falls within a specific range", "The password meets length rules"], hint: "Integer vs String.", why: "Type checks verify the user entered a number when requested." },
    { q: "A 'Presence Check' validation ensures?", a: "A mandatory field was not left blank", options: ["A mandatory field was not left blank", "The data provided is accurate", "The data provided is a secret", "The data provided is a number"], hint: "Something is there.", why: "Presence checks stop users from skipping mandatory fields." },
    { q: "A 'Range Check' validation ensures?", a: "Numerical data is between two values", options: ["Numerical data is between two values", "The data is the correct type", "The input is not an empty string", "The referenced file currently exists"], hint: "1 to 100.", why: "Range checks ensure numbers fall within a valid boundary." },
    { q: "What is 'Sanitisation' in input handling?", a: "Cleaning input of harmful script or code", options: ["Cleaning input of harmful script or code", "Deleting the variable after its use", "Formatting the monitor screen", "Updating the system software"], hint: "Anti-hacking.", why: "Sanitisation prevents attacks like SQL injection." },
    { q: "Outputting multiple items on one line is?", a: "Concatenation (joining items together)", options: ["Concatenation (joining items together)", "Iteration (repeating the items)", "Selection (choosing between items)", "Assignment (storing the items)"], hint: "Joining.", why: "Joining strings or variables for output is concatenation." },
    { q: "Which device is a common Input device?", a: "Keyboard (sending alphanumeric data)", options: ["Keyboard (sending alphanumeric data)", "Monitor (presenting visual data)", "Printer (producing physical media)", "Speakers (producing audio data)"], hint: "Data goes in.", why: "Keyboards allow users to type data into the computer." },
    { q: "Which device is a common Output device?", a: "Monitor (displaying computer data)", options: ["Monitor (displaying computer data)", "Mouse (selecting screen items)", "Microphone (capturing audio data)", "Scanner (capturing physical media)"], hint: "Data comes out.", why: "Monitors provide visual feedback to the user." },
    { q: "Why use casting with the input() function?", a: "To use input in mathematical calculations", options: ["To use input in mathematical calculations", "To make the programme print faster", "To save space on the system disk", "To prevent all logic errors"], hint: "String to Int.", why: "Input is received as a string; casting is needed for math." },
    { q: "What does an input statement do?", a: "Reads a value supplied by the user into the program", options: ["Reads a value supplied by the user into the program", "Displays a message on the screen", "Saves a value to a file on disk", "Converts a number into a string"], hint: "Data coming in.", why: "Input pauses the program until the user supplies a value." },
    { q: "Why is a prompt shown before an input?", a: "So the user knows what they are expected to type", options: ["So the user knows what they are expected to type", "To convert the input into an integer", "To make the program run faster", "To validate the value automatically"], hint: "Tell them what you want.", why: "Without a prompt the program appears frozen and the user cannot guess." },
    { q: "What must you do before using typed input in a calculation?", a: "Cast it to a numeric type", options: ["Cast it to a numeric type", "Print it to the screen first", "Store it in a list", "Compare it to zero"], hint: "It arrives as text.", why: "Adding two strings joins them, so '2' + '3' gives '23' rather than 5." },
    { q: "Which statement displays a value to the user?", a: "An output statement such as print", options: ["An output statement such as print", "An input statement", "An assignment statement", "A comment"], hint: "Data going out.", why: "Output writes to the screen; it does not change any stored value." },
    { q: "What is concatenation in an output statement?", a: "Joining strings together into one", options: ["Joining strings together into one", "Adding two numbers together", "Splitting a string into parts", "Converting text to uppercase"], hint: "Stick them together.", why: "'Hello ' + name builds one message from a fixed part and a variable." },
    { q: "Why might you convert a number to a string before output?", a: "So it can be joined to other text", options: ["So it can be joined to other text", "So it can be used in arithmetic", "So it takes up less memory", "So it can be stored in a list"], hint: "Mixing types.", why: "Many languages refuse to concatenate a number directly onto a string." },
    { q: "What does a well-designed output message include?", a: "Context explaining what the value means", options: ["Context explaining what the value means", "Only the raw number", "The name of the programmer", "The line number of the code"], hint: "Label the value.", why: "'Total: 42' is far more useful to a user than a bare 42." },
    { q: "Which is an example of an input device?", a: "A keyboard", options: ["A keyboard", "A monitor", "A printer", "A speaker"], hint: "Data enters here.", why: "Input devices send data to the computer; output devices present it." },
    { q: "What happens if a program expects a number but the user types letters?", a: "Casting fails and the program may crash", options: ["Casting fails and the program may crash", "The letters are converted to zero", "The input is ignored silently", "The program automatically retries"], hint: "Handle it.", why: "Robust programs validate or catch the error rather than crashing." },
    { q: "Why prompt with the expected format, such as DD/MM/YYYY?", a: "It reduces the chance of invalid input", options: ["It reduces the chance of invalid input", "It makes the program run faster", "It removes the need for validation", "It converts the date automatically"], hint: "Guide the user.", why: "Clear prompts prevent errors before they happen." },
    { q: "What is the output of print('5' + '5')?", a: "55", options: ["55", "10", "'5' + '5'", "An error"], hint: "Text joins.", why: "Both operands are strings, so the plus sign concatenates them." },
    { q: "What is the output of print(5 + 5)?", a: "10", options: ["10", "55", "'10'", "An error"], hint: "Numbers add.", why: "With numeric operands the plus sign performs arithmetic." },
    { q: "Why should output be formatted to two decimal places for money?", a: "So prices display as expected, such as 4.50", options: ["So prices display as expected, such as 4.50", "To make the calculation more accurate", "To convert pounds into pence", "To reduce rounding errors in storage"], hint: "Presentation only.", why: "Formatting changes how the value looks, not the value held in memory." },
    { q: "What is a sensible variable name for an input holding a pupil's age?", a: "age", options: ["age", "x", "input1", "a1b2"], hint: "Name what it holds.", why: "Meaningful names make a program readable and maintainable." },
    { q: "Which of these is an output operation?", a: "Displaying a total on screen", options: ["Displaying a total on screen", "Reading a key press", "Storing a value in a variable", "Comparing two numbers"], hint: "Showing the user.", why: "Output presents information; the others process or gather it." }
  ],
  "3.2.8 String Handling": [
    { q: "What is 'Concatenation' in strings?", a: "Joining two separate strings together", options: ["Joining two separate strings together", "Splitting a long string into parts", "Changing the case of the letters", "Calculating the string length"], hint: "Adding 'Hello' + 'World'.", why: "Concatenation creates one longer string from two smaller ones." },
    { q: "Which function finds string length?", a: "len() (returning an integer count)", options: ["len() (returning an integer count)", "size() (returning memory usage)", "count() (returning specific symbols)", "length() (returning full size)"], hint: "Short for length.", why: "The len() function returns an integer of the string's length." },
    { q: "What is 'Slicing' in string handling?", a: "Extracting a specific part of a string", options: ["Extracting a specific part of a string", "Deleting a string from memory", "Joining two strings together", "Casting a string to an integer"], hint: "Getting 'cat' from 'caterpillar'.", why: "Slicing uses indices to pick out a specific substring." },
    { q: "In 'Computer', what is the index 1 character?", a: "'o' (due to zero-based indexing)", options: ["'o' (due to zero-based indexing)", "'C' (due to starting position)", "'m' (due to third position)", "'p' (due to fourth position)"], hint: "Starts at 0.", why: "Index 0 is 'C', index 1 is 'o'." },
    { q: "How do you convert a string to ALL CAPS?", a: ".upper() (standard uppercase method)", options: [".upper() (standard uppercase method)", ".lower() (standard lowercase method)", ".capital() (sentence case method)", ".big() (visual size method)"], hint: "Higher case.", why: "The upper method converts all characters to uppercase." },
    { q: "How do you convert a string to lowercase?", a: ".lower() (standard lowercase method)", options: [".lower() (standard lowercase method)", ".upper() (standard uppercase method)", ".small() (visual size method)", ".case() (general case method)"], hint: "Opposite of upper.", why: "The lower method converts all characters to lowercase." },
    { q: "Finding a character's position is called?", a: ".find() or .index() (search methods)", options: [".find() or .index() (search methods)", ".len() (measurement method)", ".upper() (formatting method)", ".slicing() (extraction method)"], hint: "Searching.", why: "These methods return the index of a character within a string." },
    { q: "What is the length of the string 'GCSE'?", a: "4 (counting each unique character)", options: ["4 (counting each unique character)", "3 (excluding the start index)", "5 (including a null terminator)", "0 (as it is not a sentence)"], hint: "Count the letters.", why: "There are four characters in 'GCSE'." },
    { q: "What is the last index in a string of length 10?", a: "9 (length minus one due to zero start)", options: ["9 (length minus one due to zero start)", "10 (matching the total length)", "0 (marking the start index)", "1 (marking the first unit)"], hint: "Length minus one.", why: "Because indexing starts at 0, the last index is length - 1." },
    { q: "Replacing 'cat' with 'dog' in a string is?", a: "String manipulation (editing text)", options: ["String manipulation (editing text)", "Casting (changing data types)", "Boolean logic (comparing states)", "Iteration (repeating sequences)"], hint: "Changing the text.", why: "Manipulation involves methods that modify or analyse strings." },
    { q: "Which character is at name[0] for 'Bob'?", a: "'B' (the first character in the string)", options: ["'B' (the first character in the string)", "'o' (the middle character unit)", "'b' (the final character unit)", "null (as it is not indexed)"], hint: "The first one.", why: "Index 0 is the start of the string." },
    { q: "Joining 'A' and 'B' to get 'AB' uses?", a: "The + operator (concatenation)", options: ["The + operator (concatenation)", "The * operator (multiplication)", "The / operator (division symbol)", "The - operator (subtraction)"], hint: "Plus symbol.", why: "The plus symbol is used for string concatenation." },
    { q: "Converting '123' to 123 is called?", a: "Casting to Integer (changing type)", options: ["Casting to Integer (changing type)", "Casting to String (keeping type)", "Concatenation (joining items)", "Slicing (extracting items)"], hint: "String to number.", why: "Casting changes the type while keeping literal data." },
    { q: "Can you slice a string using negative numbers?", a: "Yes, to count back from the end", options: ["Yes, to count back from the end", "No, indices must be positive", "Only for integer data types", "Only for Boolean logic tasks"], hint: "Counting from the end.", why: "Negative indices allow counting backwards from the end." },
    { q: "What is 'ASCII' in string handling?", a: "Numerical codes for every character", options: ["Numerical codes for every character", "A type of loop for repetitions", "A way to save system files", "A sorting algorithm for data"], hint: "Character encoding.", why: "Strings are stored as binary numbers based on character sets." },
    { q: "What does len('Computer') return?", a: "8", options: ["8", "7", "9", "1"], hint: "Count every character.", why: "Length counts characters, so the last valid index is 7." },
    { q: "What does 'Hello'.upper() return?", a: "HELLO", options: ["HELLO", "hello", "Hello", "5"], hint: "All capitals.", why: "Case conversion is often used to make comparisons case-insensitive." },
    { q: "What does word[0:3] return for word = 'Computer'?", a: "Com", options: ["Com", "Comp", "omp", "uter"], hint: "Start included, end excluded.", why: "Slicing takes characters 0, 1 and 2 but stops before index 3." },
    { q: "Why convert both strings to lowercase before comparing them?", a: "So differences in capitalisation are ignored", options: ["So differences in capitalisation are ignored", "So the comparison runs faster", "So the strings use less memory", "So numbers inside are converted too"], hint: "YES should match yes.", why: "Without it, 'Yes' and 'yes' would be treated as different answers." },
    { q: "What is the index of the last character of a string of length 10?", a: "9", options: ["9", "10", "11", "0"], hint: "Zero-indexed.", why: "Indexes run from 0 to length minus one." },
    { q: "What does 'a,b,c'.split(',') produce?", a: "A list of three items", options: ["A list of three items", "A single string with commas removed", "The number 3", "An error"], hint: "Break on the separator.", why: "Splitting turns delimited text into a list you can loop over." },
    { q: "How do you join a first and last name with a space?", a: "first + ' ' + last", options: ["first + ' ' + last", "first + last", "first - last", "first * last"], hint: "Concatenate three parts.", why: "Without the middle space the names run together." },
    { q: "What does ord('A') return?", a: "The character code for A", options: ["The character code for A", "The letter A", "The position of A in the string", "The length of A"], hint: "Character to number.", why: "ord gives the ASCII/Unicode value, 65 for capital A." },
    { q: "What does chr(66) return?", a: "B", options: ["B", "66", "A", "b"], hint: "Number to character.", why: "chr is the inverse of ord; 66 is the code for capital B." },
    { q: "What does 'Computer'[3] give?", a: "p", options: ["p", "m", "u", "o"], hint: "Count from zero.", why: "C is 0, o is 1, m is 2 and p is 3." },
    { q: "How would you check whether a password is at least 8 characters?", a: "if len(password) >= 8", options: ["if len(password) >= 8", "if password >= 8", "if len(password) > 8", "if password.length = 8"], hint: "Measure the length.", why: "Using > 8 would wrongly reject a password of exactly eight characters." },
    { q: "What does 'Hello World'.lower() return?", a: "hello world", options: ["hello world", "HELLO WORLD", "Hello world", "hello World"], hint: "All small letters.", why: "Every alphabetic character is converted to lowercase." },
    { q: "What is string traversal?", a: "Visiting each character in turn with a loop", options: ["Visiting each character in turn with a loop", "Reversing the order of the characters", "Converting a string to a number", "Removing spaces from a string"], hint: "Walk through it.", why: "Traversal is how you count vowels or check each character in turn." },
    { q: "Which slice returns the last three characters of an 8-character word?", a: "word[5:8]", options: ["word[5:8]", "word[6:8]", "word[5:7]", "word[3:8]"], hint: "Length minus three.", why: "Indexes 5, 6 and 7 are the final three characters." },
    { q: "Why is string handling useful for validating an email address?", a: "You can check for an @ symbol and its position", options: ["You can check for an @ symbol and its position", "Strings automatically reject invalid emails", "Emails are stored as integers", "It converts the address to lowercase"], hint: "Search inside the text.", why: "Length checks and character searches form basic format validation." }
  ],
  "3.2.9 Random Numbers": [
    { q: "Which library is needed for random in Python?", a: "import random (standard module)", options: ["import random (standard module)", "import math (math module)", "import time (clock module)", "import numbers (numerical module)"], hint: "The word itself.", why: "The random module contains functions for generating random data." },
    { q: "Which function generates a random integer?", a: "randint() (returning a whole value)", options: ["randint() (returning a whole value)", "random() (returning a float value)", "rand() (returning a raw value)", "getrand() (returning any value)"], hint: "Random Int.", why: "randint(a, b) returns a random whole number between a and b." },
    { q: "Why are random numbers used in games?", a: "To create unpredictable behaviours", options: ["To create unpredictable behaviours", "To make code execute faster", "To save system memory space", "To fix all syntax error types"], hint: "Rolling dice.", why: "Randomness ensures games aren't the same every time." },
    { q: "What is a 'Pseudo-random' number?", a: "A number following a complex formula", options: ["A number following a complex formula", "A truly random natural event", "A number that is always zero", "A number selected by the user"], hint: "Fake random.", why: "Computers use algorithms to generate random-looking numbers." },
    { q: "What is the range of random.randint(1, 6)?", a: "1 to 6 inclusive (both numbers included)", options: ["1 to 6 inclusive (both numbers included)", "1 to 5 (excluding the high end)", "0 to 6 (including the zero start)", "2 to 5 (excluding both ends)"], hint: "Like a standard die.", why: "randint usually includes both the start and end values." },
    { q: "A random float between 0.0 and 1.0 uses?", a: "random.random() (standard float)", options: ["random.random() (standard float)", "random.randint() (standard integer)", "random.float() (non-standard)", "random.get() (non-standard)"], hint: "No arguments needed.", why: "The random() function returns a decimal between 0 and 1." },
    { q: "To pick a random item from a list, use?", a: "random.choice() (picks one element)", options: ["random.choice() (picks one element)", "random.pick() (non-standard command)", "random.randint() (numerical only)", "random.item() (non-standard command)"], hint: "Making a choice.", why: "choice() selects one random element from an existing list." },
    { q: "Shuffling a list into a random order uses?", a: "random.shuffle() (reorders the list)", options: ["random.shuffle() (reorders the list)", "random.mix() (non-standard command)", "random.move() (non-standard command)", "random.sort() (orders the list)"], hint: "Like a deck of cards.", why: "shuffle() reorganises items in a list randomly." },
    { q: "What is a 'Seed' in random generation?", a: "The start value for the random formula", options: ["The start value for the random formula", "A type of computer virus code", "The end point of an iteration loop", "A small local variable for data"], hint: "Planting a start.", why: "Using the same seed produces the same 'random' sequence." },
    { q: "Are computers naturally good at being random?", a: "No, they are deterministic machines", options: ["No, they are deterministic machines", "Yes, they are naturally chaotic", "Only high-end gaming computers", "Only if connected to the internet"], hint: "They follow rules.", why: "Computers follow instructions; true randomness requires sensors." },
    { q: "Which to use for a coin flip simulation?", a: "randint(0, 1) (two distinct results)", options: ["randint(0, 1) (two distinct results)", "randint(1, 10) (ten distinct results)", "random() (unlimited decimal results)", "shuffle() (reordering the results)"], hint: "Two outcomes.", why: "0 for Heads, 1 for Tails represents a 50/50 chance." },
    { q: "What is the benefit of setting a random seed?", a: "To repeat 'random' results for testing", options: ["To repeat 'random' results for testing", "To make numbers even more random", "To speed up the central processor", "To save space on the system disk"], hint: "Debugging.", why: "Setting a seed allows developers to recreate bugs." },
    { q: "Random numbers are essential for which field?", a: "Cryptography (securing sensitive data)", options: ["Cryptography (securing sensitive data)", "Database design and organisation", "Web layout and graphic design", "Hardware repair and maintenance"], hint: "Secret codes.", why: "Strong encryption requires unpredictable random keys." },
    { q: "Can random.randint(5, 5) return anything else?", a: "No (the start and end are identical)", options: ["Yes (as it is still a random call)", "No (the start and end are identical)"], hint: "The range is zero.", why: "The range starts and ends at the same number." },
    { q: "Is random.randint(10, 1) valid in Python?", a: "No, it causes an error (start > end)", options: ["No, it causes an error (start > end)", "Yes, it counts backwards automatically", "Yes, it returns a zero by default", "Yes, it returns a decimal by default"], hint: "Start must be smaller than end.", why: "The start value must be less than or equal to the end." },
    { q: "Why are random numbers useful in programs?", a: "They make games and simulations unpredictable", options: ["They make games and simulations unpredictable", "They make programs run faster", "They reduce the memory a program needs", "They prevent all logic errors"], hint: "Variety.", why: "Dice rolls, shuffles and test data all rely on unpredictability." },
    { q: "What does random.randint(1, 6) simulate?", a: "Rolling a six-sided dice", options: ["Rolling a six-sided dice", "Tossing a coin", "Picking a card from 52", "Choosing a random letter"], hint: "Six equally likely values.", why: "It returns a whole number from 1 to 6 inclusive." },
    { q: "Why are computer random numbers called 'pseudo-random'?", a: "They are produced by a formula, not true chance", options: ["They are produced by a formula, not true chance", "They are always the same number", "They can only be whole numbers", "They are random only on the first run"], hint: "An algorithm makes them.", why: "Given the same seed the sequence repeats exactly, which true randomness would not." },
    { q: "What is the benefit of setting a fixed seed while testing?", a: "The same sequence is produced every run, so bugs repeat", options: ["The same sequence is produced every run, so bugs repeat", "The numbers become truly random", "The program runs faster", "Random numbers are disabled"], hint: "Reproducibility.", why: "A repeatable sequence lets you reproduce and fix a fault reliably." },
    { q: "How would you pick a random item from a list called colours?", a: "colours[random.randint(0, len(colours) - 1)]", options: ["colours[random.randint(0, len(colours) - 1)]", "colours[random.randint(1, len(colours))]", "random.randint(colours)", "colours.randint()"], hint: "Index from 0 to length-1.", why: "Using len(colours) as the upper bound would go past the end of the list." },
    { q: "How many possible outcomes does random.randint(0, 9) have?", a: "10", options: ["10", "9", "11", "0"], hint: "Both ends included.", why: "The values 0 to 9 inclusive give ten outcomes." },
    { q: "Which use of randomness would be inappropriate?", a: "Choosing a pupil's exam grade", options: ["Choosing a pupil's exam grade", "Shuffling quiz questions", "Generating an enemy's position in a game", "Producing sample test data"], hint: "Fairness matters.", why: "Outcomes with real consequences must be determined by rules, not chance." },
    { q: "What must you usually do before using random functions?", a: "Import the random library", options: ["Import the random library", "Declare a random variable", "Convert numbers to strings", "Set the program to run twice"], hint: "Bring in the module.", why: "Random functions live in a library that must be imported first." },
    { q: "What does random.randint(5, 5) return?", a: "Always 5", options: ["Always 5", "A number between 0 and 5", "An error", "A different number each time"], hint: "The range has one value.", why: "When both bounds are equal there is only one possible outcome." },
    { q: "How could you simulate a coin toss?", a: "random.randint(0, 1) and treat 0 as heads", options: ["random.randint(0, 1) and treat 0 as heads", "random.randint(1, 6)", "random.randint(0, 100)", "random.randint(2, 2)"], hint: "Two outcomes.", why: "Two equally likely values model the two sides of a coin." },
    { q: "Why might a shuffled quiz use randomness carefully?", a: "To avoid repeating a question in the same session", options: ["To avoid repeating a question in the same session", "To make the questions harder", "To reduce the file size", "To prevent the user from answering"], hint: "Sample without replacement.", why: "Picking independently each time could show the same question twice." },
    { q: "What is the range of random.randint(10, 20)?", a: "10 to 20 inclusive", options: ["10 to 20 inclusive", "11 to 19", "10 to 19", "1 to 20"], hint: "Both bounds included.", why: "randint includes both endpoints, giving eleven possible values." },
    { q: "Why should a lottery program not rely on a fixed seed?", a: "Everyone could predict the winning numbers", options: ["Everyone could predict the winning numbers", "The numbers would be too large", "It would use too much memory", "The program would run slowly"], hint: "Predictable is not fair.", why: "A known seed makes the whole sequence reproducible by anyone." },
    { q: "How do you generate a random number between 1 and 100?", a: "random.randint(1, 100)", options: ["random.randint(1, 100)", "random.randint(0, 100)", "random.randint(1, 99)", "random.randint(100)"], hint: "State both bounds.", why: "Both endpoints are included, giving exactly 100 possible values." },
    { q: "What is a sensible test for a dice function returning 1 to 6?", a: "Run it many times and check no value falls outside 1 to 6", options: ["Run it many times and check no value falls outside 1 to 6", "Run it once and check it returns 3", "Check that it always returns the same value", "Check that it never returns 6"], hint: "Test the range.", why: "A single run cannot show the full range, so repeated sampling is needed." }
  ],
  "3.2.10 Subroutines": [
    { q: "What is a 'Subroutine' in programming?", a: "A named block of code for a specific task", options: ["A named block of code for a specific task", "A small variable for storing data", "A type of loop for repeating code", "A physical component of the hardware"], hint: "Functions/Procedures.", why: "Subroutines help break down complex programmes." },
    { q: "What is the main advantage of subroutines?", a: "Code reuse and improved organisation", options: ["Code reuse and improved organisation", "Making the hardware process faster", "Reducing total electricity consumption", "Preventing all types of syntax errors"], hint: "Don't repeat yourself.", why: "You can write code once and call it many times." },
    { q: "What is a 'Procedure' in programming?", a: "A subroutine that does NOT return a value", options: ["A subroutine that does NOT return a value", "A subroutine that returns a data value", "A type of constant variable for data", "A loop that executes for an infinite time"], hint: "Just performs an action.", why: "Procedures execute code but don't send data back." },
    { q: "What is a 'Function' in programming?", a: "A subroutine that RETURNS a data value", options: ["A subroutine that RETURNS a data value", "A subroutine that does not return data", "A type of physical hardware device", "A comment written to explain the code"], hint: "Calculates and sends back.", why: "Functions perform a task and 'return' a result." },
    { q: "In a subroutine definition, what is a parameter?", a: "A placeholder variable for receiving data", options: ["A placeholder variable for receiving data", "An actual value sent into a subroutine", "The specific name of the subroutine", "An error message shown on the screen"], hint: "The placeholder.", why: "Parameters are variables that wait for data." },
    { q: "What is an 'Argument' in subroutines?", a: "The actual data value passed in during call", options: ["The actual data value passed in during call", "A placeholder variable in the header", "A logic error found during code testing", "A type of constant value for memory"], hint: "The real data.", why: "Arguments are the values you provide when calling." },
    { q: "What is 'Scope' in programming?", a: "The parts of code where a variable is seen", options: ["The parts of code where a variable is seen", "The physical size of the monitor screen", "The processing speed of the motherboard", "The total number of lines in a code file"], hint: "Global vs Local.", why: "Scope determines which parts can access a variable." },
    { q: "What is a 'Local Variable'?", a: "A variable declared inside a specific subroutine", options: ["A variable declared inside a specific subroutine", "A variable accessible by any part of code", "A variable stored on a remote web server", "A constant value that cannot be changed"], hint: "Limited access.", why: "Local variables only exist during subroutine execution." },
    { q: "What is a 'Global Variable'?", a: "A variable declared outside all subroutines", options: ["A variable declared outside all subroutines", "A variable only found in one function", "A variable that cannot be changed by code", "A type of physical hardware component"], hint: "Universal access.", why: "Global variables can be accessed by any part of code." },
    { q: "Why are local variables generally preferred?", a: "They prevent accidental data changes elsewhere", options: ["They prevent accidental data changes elsewhere", "They use significantly more system memory", "They are much faster for a coder to type", "They make the code much harder to read"], hint: "Safety and bugs.", why: "Encapsulating data locally makes debugging easier." },
    { q: "What does the 'return' keyword do?", a: "Sends a value back to the calling code", options: ["Sends a value back to the calling code", "Stops the entire computer hardware", "Deletes a variable from the system RAM", "Repeats the subroutine until finished"], hint: "Exit with data.", why: "Return ends the function and provides the output." },
    { q: "When a subroutine calls ITSELF, it is called?", a: "Recursion (a function calling itself)", options: ["Recursion (a function calling itself)", "Iteration (a loop repeating code)", "Selection (a choice between paths)", "Infinite (a never-ending structure)"], hint: "Mirror effect.", why: "Recursion is a technique where a function calls itself." },
    { q: "Breaking a problem using subroutines is?", a: "Decomposition (splitting into sub-tasks)", options: ["Decomposition (splitting into sub-tasks)", "Abstraction (removing unnecessary data)", "Binary (converting into base-2 values)", "Sorting (ordering data into a sequence)"], hint: "Breaking down.", why: "Decomposition is a core computational thinking skill." },
    { q: "A subroutine 'Header' contains?", a: "The unique name and any parameters needed", options: ["The unique name and any parameters needed", "The entire block of algorithmic code", "The final return value of the function", "The copyright information of the coder"], hint: "The top line.", why: "The header defines how the subroutine is identified." },
    { q: "Can a procedure have parameters?", a: "Yes (it can receive data without returning it)", options: ["Yes (it can receive data without returning it)", "No (only functions can receive data)"], hint: "Input but no output.", why: "Both functions and procedures can receive data." },
    { q: "What is the difference between a function and a procedure?", a: "A function returns a value; a procedure does not", options: ["A function returns a value; a procedure does not", "A procedure returns a value; a function does not", "Functions cannot take parameters", "Procedures cannot be called twice"], hint: "Does it send something back?", why: "A function's result can be stored or used in an expression." },
    { q: "What is a parameter?", a: "A variable in the subroutine definition that receives a value", options: ["A variable in the subroutine definition that receives a value", "A value returned from a subroutine", "A variable declared outside all subroutines", "A name given to the subroutine"], hint: "The input to the routine.", why: "Parameters let the same subroutine work on different data." },
    { q: "What does the RETURN statement do?", a: "Sends a value back to the code that called the subroutine", options: ["Sends a value back to the code that called the subroutine", "Ends the whole program", "Prints a value to the screen", "Restarts the subroutine"], hint: "Hand the answer back.", why: "Without RETURN the caller receives nothing, often shown as None." },
    { q: "What is a local variable?", a: "One that exists only inside the subroutine that created it", options: ["One that exists only inside the subroutine that created it", "One available everywhere in the program", "One stored permanently on disk", "One that cannot be changed"], hint: "Limited scope.", why: "Locals prevent subroutines accidentally overwriting each other's data." },
    { q: "Why are subroutines useful in a large program?", a: "They avoid repeating code and make it easier to maintain", options: ["They avoid repeating code and make it easier to maintain", "They make the program run without errors", "They remove the need for variables", "They increase the file size deliberately"], hint: "Write once, call often.", why: "A fix in one subroutine applies everywhere it is used." },
    { q: "What is 'scope'?", a: "The region of a program where a variable can be used", options: ["The region of a program where a variable can be used", "The number of parameters a subroutine takes", "The size of a variable in memory", "The order subroutines are called in"], hint: "Where it is visible.", why: "Scope explains why a local variable cannot be read from outside." },
    { q: "A function calculates but prints nothing and has no RETURN. What is the result?", a: "The caller receives no usable value", options: ["The caller receives no usable value", "The value is printed automatically", "The program crashes immediately", "The value is stored globally"], hint: "Nothing sent back.", why: "This is a common bug producing None where a number was expected." },
    { q: "What is a global variable?", a: "One that can be accessed anywhere in the program", options: ["One that can be accessed anywhere in the program", "One that only exists inside a loop", "One that cannot be changed once set", "One passed into a subroutine"], hint: "Visible everywhere.", why: "Globals are convenient but risky because any code can change them." },
    { q: "How many values can a subroutine take as parameters?", a: "As many as the design requires, including none", options: ["As many as the design requires, including none", "Exactly one", "Exactly two", "No more than three"], hint: "It varies.", why: "Parameter lists are chosen to suit the task." },
    { q: "Why prefer local variables over globals?", a: "They reduce the chance of unintended side effects", options: ["They reduce the chance of unintended side effects", "They make the program run faster", "They use no memory at all", "They can hold more data"], hint: "Contain the damage.", why: "Restricting scope means a bug affects only the subroutine it lives in." },
    { q: "What happens when a subroutine is called?", a: "Execution jumps into it, then returns to the calling point", options: ["Execution jumps into it, then returns to the calling point", "The program restarts from the beginning", "The subroutine runs after the program ends", "The rest of the program is skipped"], hint: "Go and come back.", why: "The return point is remembered so execution continues where it left off." },
    { q: "Which is the best use for a function that returns a value?", a: "Calculating a total that the caller then displays", options: ["Calculating a total that the caller then displays", "Printing a welcome banner", "Clearing the screen", "Ending the program"], hint: "It produces an answer.", why: "Tasks that produce a result suit functions; tasks that just act suit procedures." },
    { q: "What is an argument?", a: "The actual value supplied when calling a subroutine", options: ["The actual value supplied when calling a subroutine", "The name used inside the subroutine definition", "The value the subroutine returns", "A comment describing the subroutine"], hint: "What you pass in.", why: "Parameters are the named placeholders; arguments are the real values." },
    { q: "Why is a subroutine easier to test than a long program?", a: "It can be tested on its own with known inputs", options: ["It can be tested on its own with known inputs", "It never contains any errors", "It runs faster than other code", "It does not need any parameters"], hint: "Test in isolation.", why: "Small units with clear inputs and outputs are quick to check." },
    { q: "What does 'reusable' mean for a subroutine?", a: "It can be called many times from different places", options: ["It can be called many times from different places", "It can be edited after the program runs", "It works in any programming language", "It stores its results permanently"], hint: "Call it again.", why: "One well-written routine can serve the whole program." }
  ],
  "3.2.11 Files and Robustness": [
    { q: "Which mode is used to open a file for READING?", a: "read mode ('r' - view only access)", options: ["read mode ('r' - view only access)", "write mode ('w' - creates new file)", "append mode ('a' - adds to the end)", "open mode ('o' - generic opening)"], hint: "Standard 'r'.", why: "Read mode allows viewing data without changes." },
    { q: "Which mode OVERWRITES an existing file?", a: "write mode ('w' - deletes old content)", options: ["write mode ('w' - deletes old content)", "read mode ('r' - views the content)", "append mode ('a' - keeps old content)", "delete mode ('d' - removes the file)"], hint: "Deletes old data.", why: "Write mode clears the file before adding new data." },
    { q: "Which mode ADDS data to the end of a file?", a: "append mode ('a' - adds to the bottom)", options: ["append mode ('a' - adds to the bottom)", "write mode ('w' - starts from the top)", "read mode ('r' - only views the data)", "update mode ('u' - edits the data)"], hint: "Keep existing data.", why: "Append mode adds data without deleting anything." },
    { q: "Why must you 'Close' a file after use?", a: "To free system resources and save data", options: ["To free system resources and save data", "To make the final file size smaller", "To prevent all computer virus types", "To turn off the computer monitor"], hint: "Proper cleanup.", why: "Closing a file releases the lock on it." },
    { q: "What is 'Defensive Programming'?", a: "Writing code that handles unexpected errors", options: ["Writing code that handles unexpected errors", "Using a physical network firewall", "Writing code as quickly as possible", "Hiding the source code from other users"], hint: "Preparing for the worst.", why: "It ensures the programme doesn't crash on bad input." },
    { q: "What is a 'Syntax Error'?", a: "A mistake in the language grammar rules", options: ["A mistake in the language grammar rules", "A mistake in the logical algorithm steps", "An error that occurs during programme run", "A physical fault in the system hardware"], hint: "Spelling or punctuation.", why: "Syntax errors prevent the code from running." },
    { q: "What is a 'Logic Error'?", a: "The code runs but provides wrong results", options: ["The code runs but provides wrong results", "The code fails to start or compile", "The entire computer hardware crashes", "A variable name is spelled incorrectly"], hint: "The math is wrong.", why: "Logic errors are caused by flawed thinking in algorithms." },
    { q: "What is a 'Runtime Error'?", a: "An error that occurs while code is running", options: ["An error that occurs while code is running", "A typo found in the written source code", "A mistake made in the planning phase", "A physical problem with the printer"], hint: "e.g. Dividing by zero.", why: "Runtime errors happen when code asks for the impossible." },
    { q: "What is a 'Trace Table' used for?", a: "To manually check algorithmic logic steps", options: ["To manually check algorithmic logic steps", "To list all variables in alphabetical order", "To increase the speed of the processor", "To connect to a remote server database"], hint: "Dry running.", why: "Trace tables track values to find logic errors." },
    { q: "What is 'Input Validation'?", a: "Checking if user data meets specific rules", options: ["Checking if user data meets specific rules", "Asking a user for their private name", "Saving all user data to a local file", "Printing the results to a monitor screen"], hint: "Stopping bad data.", why: "Validation ensures only sensible data is processed." },
    { q: "A 'Range Check' ensures?", a: "A number falls between two specific values", options: ["A number falls between two specific values", "A field has not been left entirely blank", "The data provided is a text-based string", "The password used is unique and secret"], hint: "1 to 10.", why: "Range checks define acceptable boundaries." },
    { q: "A 'Length Check' ensures?", a: "Input has the correct character count", options: ["Input has the correct character count", "The system file size is kept very small", "The numerical value is extremely high", "The source code is written very briefly"], hint: "e.g. 8 digits.", why: "Length checks are common for passwords or IDs." },
    { q: "What is 'Authentication'?", a: "Verifying the identity of a system user", options: ["Verifying the identity of a system user", "Deleting a user's account permanently", "Fixing a bug found in the source code", "Printing a report for a user to view"], hint: "Passwords and logins.", why: "Authentication ensures only authorised access." },
    { q: "Why are comments used in code?", a: "To explain the logic to human readers", options: ["To explain the logic to human readers", "To make the programme execute faster", "To save system memory space", "To change how the actual code works"], hint: "Using # or //.", why: "Comments help humans understand the logic." },
    { q: "Which error is generally hardest to find?", a: "Logic Error (no crash, just wrong output)", options: ["Logic Error (no crash, just wrong output)", "Syntax Error (stops code from running)", "Runtime Error (crashes code while running)", "Compilation Error (stops the build)"], hint: "The computer thinks it's fine.", why: "Logic errors don't cause crashes, so you must notice them." },
    { q: "Which file mode overwrites any existing content?", a: "Write mode", options: ["Write mode", "Append mode", "Read mode", "Update mode"], hint: "It starts fresh.", why: "Opening for writing truncates the file, so existing data is lost." },
    { q: "Which file mode adds to the end of an existing file?", a: "Append mode", options: ["Append mode", "Write mode", "Read mode", "Delete mode"], hint: "Add on the end.", why: "Append preserves existing content and writes after it." },
    { q: "Why should a file be closed after use?", a: "To make sure all data is saved and resources are freed", options: ["To make sure all data is saved and resources are freed", "To delete the file from disk", "To convert the file to text", "To prevent the file being read again"], hint: "Flush and release.", why: "Buffered data may not reach the disk until the file is closed." },
    { q: "What is validation?", a: "Checking input is sensible before it is used", options: ["Checking input is sensible before it is used", "Checking the program has no syntax errors", "Checking the file exists on disk", "Checking the output is printed correctly"], hint: "Is it reasonable?", why: "Validation rejects impossible values such as a negative age." },
    { q: "What is a range check?", a: "Testing a value falls between a minimum and maximum", options: ["Testing a value falls between a minimum and maximum", "Testing a value is the right data type", "Testing a value is not blank", "Testing a value appears in a list"], hint: "Between two bounds.", why: "A month must be 1 to 12; anything else is rejected." },
    { q: "What is a presence check?", a: "Testing that something was actually entered", options: ["Testing that something was actually entered", "Testing the value is a number", "Testing the value is within range", "Testing the file is present on disk"], hint: "Not left blank.", why: "Required fields such as a surname must not be empty." },
    { q: "What is a length check?", a: "Testing the number of characters entered", options: ["Testing the number of characters entered", "Testing the value is long enough to store", "Testing how long the program runs", "Testing the size of the file"], hint: "How many characters.", why: "A UK postcode has a limited length, so anything longer is suspect." },
    { q: "What is authentication?", a: "Confirming a user is who they claim to be", options: ["Confirming a user is who they claim to be", "Checking data is in the right format", "Saving data to a file", "Encrypting a password"], hint: "Prove your identity.", why: "Usernames and passwords are the most common example." },
    { q: "Why is a robust program better than one that crashes?", a: "It handles unexpected input without failing", options: ["It handles unexpected input without failing", "It runs more quickly", "It uses less storage space", "It needs fewer variables"], hint: "Cope with the unexpected.", why: "Users make mistakes, and a robust program recovers gracefully." },
    { q: "What should happen if a user enters text where a number is required?", a: "The program should ask again with a clear message", options: ["The program should ask again with a clear message", "The program should stop with an error", "The text should be stored anyway", "The value should be set to zero silently"], hint: "Re-prompt.", why: "Silently substituting a value hides the mistake and corrupts the data." },
    { q: "What is a type check?", a: "Testing the value is the expected data type", options: ["Testing the value is the expected data type", "Testing the value is within range", "Testing the value is not empty", "Testing the value is unique"], hint: "Is it a number?", why: "Attempting arithmetic on text would otherwise crash the program." },
    { q: "Why use test data that is deliberately invalid?", a: "To prove the validation rejects it correctly", options: ["To prove the validation rejects it correctly", "To make the program run faster", "To fill the file with sample values", "To remove the need for normal test data"], hint: "Try to break it.", why: "Testing only valid data proves nothing about how failures are handled." },
    { q: "What is boundary test data?", a: "Values right at the edge of what is acceptable", options: ["Values right at the edge of what is acceptable", "Values far outside the acceptable range", "Values in the middle of the range", "Values of the wrong data type"], hint: "On the limit.", why: "For a 1 to 10 range, 1 and 10 are boundaries where off-by-one bugs hide." },
    { q: "What happens if a program tries to read a file that does not exist?", a: "An error occurs unless the program handles it", options: ["An error occurs unless the program handles it", "The file is created automatically in read mode", "An empty string is returned silently", "The program waits until the file appears"], hint: "Check first.", why: "Robust code checks the file exists or catches the resulting error." },
    { q: "Why write records to a file rather than keeping them in a list?", a: "Data in a file survives after the program closes", options: ["Data in a file survives after the program closes", "Files can be searched more quickly than lists", "Files use less memory while running", "Lists cannot store text"], hint: "Persistence.", why: "Main memory is volatile, so unsaved data is lost when the program ends." }
  ],

  // --- PAPER 2: COMPUTING CONCEPTS ---
  "3.3.1 Number bases": [
    { q: "Which number base is used by computer hardware at the transistor level?", a: "Binary (Base 2) consisting only of bits 0 and 1", options: ["Binary (Base 2) consisting only of bits 0 and 1", "Denary (Base 10) consisting of digits 0 through 9", "Hexadecimal (Base 16) using digits and characters", "Octal (Base 8) consisting of digits 0 through 7"], hint: "Off and On states.", why: "Computers use bistable devices that only recognise two distinct electrical states." },
    { q: "Why is Hexadecimal frequently used by computer programmers?", a: "It provides a shorter, human-readable version of binary", options: ["It provides a shorter, human-readable version of binary", "It allows the central processor to execute code faster", "It reduces the total amount of physical RAM required", "It prevents the occurrence of complex syntax errors"], hint: "Easier for humans to read.", why: "One Hex digit represents exactly four bits (a nibble), making it easier to manage large binary values." },
    { q: "What is the maximum Denary value a 4-bit binary number can hold?", a: "15 (calculated as 2 to the power of 4, minus 1)", options: ["15 (calculated as 2 to the power of 4, minus 1)", "16 (calculated as the total number of combinations)", "8 (calculated as the highest power of two available)", "4 (calculated as the total number of bits present)"], hint: "1111 in binary.", why: "With 4 bits, you can represent 16 values (0-15)." },
    { q: "What is the Denary equivalent of the binary number 1010?", a: "10 (adding the 8-weight and the 2-weight columns)", options: ["10 (adding the 8-weight and the 2-weight columns)", "12 (adding the 8-weight and the 4-weight columns)", "5 (adding the 4-weight and the 1-weight columns)", "8 (representing only the highest weighted column)"], hint: "8 + 0 + 2 + 0.", why: "In 4-bit binary, the columns are weighted 8, 4, 2, 1." },
    { q: "In Hexadecimal, which character represents the Denary value 10?", a: "A (the first letter used after the digit nine)", options: ["A (the first letter used after the digit nine)", "F (the final letter used in the base-16 system)", "B (the second letter used to represent eleven)", "X (a non-standard character for large values)"], hint: "A-F are used for 10-15.", why: "Hexadecimal uses 0-9 and then A-F for values 10-15." },
    { q: "How many bits are represented by a single Hexadecimal digit?", a: "4 bits (commonly referred to as a binary nibble)", options: ["4 bits (commonly referred to as a binary nibble)", "8 bits (commonly referred to as a complete byte)", "2 bits (commonly referred to as a binary couplet)", "16 bits (commonly referred to as a processor word)"], hint: "Half a byte.", why: "Since 16 is 2 to the power of 4, one hex digit covers 4 bits." },
    { q: "What occurs during a binary 'Overflow' error?", a: "The result of a calculation exceeds the available bits", options: ["The result of a calculation exceeds the available bits", "The central processor loses its electrical connection", "The binary digits are inverted from zeros into ones", "The programme is deleted from the secondary storage"], hint: "Too many bits for the box.", why: "Overflow happens when a number is too large to be stored in the allocated space." },
    { q: "What is the result of shifting binary 0100 one place to the left?", a: "1000 (mathematically equivalent to doubling the value)", options: ["1000 (mathematically equivalent to doubling the value)", "0010 (mathematically equivalent to halving the value)", "0101 (mathematically equivalent to adding one unit)", "0110 (mathematically equivalent to adding two units)"], hint: "Logical shift left.", why: "A left shift doubles the number by moving digits to higher-weight columns." },
    { q: "What is the Denary value of the Hexadecimal number 10?", a: "16 (one 16-weight unit and zero 1-weight units)", options: ["16 (one 16-weight unit and zero 1-weight units)", "10 (as it appears identical to the denary system)", "1 (representing only the first digit in the pair)", "256 (representing sixteen squared in the system)"], hint: "16 + 0.", why: "In Hex, the columns are weighted ... 256, 16, 1." },
    { q: "Which of these is a valid Hexadecimal colour code?", a: "#FF5733 (using characters from the base-16 set)", options: ["#FF5733 (using characters from the base-16 set)", "#GG8811 (containing characters outside the set)", "#1010101 (containing too many numerical digits)", "#RED001 (containing non-standard English words)"], hint: "0-9 and A-F only.", why: "Hex codes are 6 characters long using only valid hex digits." },
    { q: "A binary right shift of two places performs what action?", a: "Integer division by four (discarding any remainder)", options: ["Integer division by four (discarding any remainder)", "Integer division by two (discarding any remainder)", "Multiplication by four (increasing the total value)", "Multiplication by two (increasing the total value)"], hint: "2 places = 2 squared.", why: "Each right shift halves the value; two shifts divide by four." },
    { q: "What is the largest Hexadecimal digit value?", a: "F (which is equivalent to Denary fifteen)", options: ["F (which is equivalent to Denary fifteen)", "E (which is equivalent to Denary fourteen)", "9 (which is the highest numerical digit used)", "16 (which is the base number of the system)"], hint: "The last letter.", why: "F is the 16th symbol (0-15)." },
    { q: "What is the binary representation of the Denary number 7?", a: "0111 (adding the 4, 2, and 1-weight columns)", options: ["0111 (adding the 4, 2, and 1-weight columns)", "1110 (adding the 8, 4, and 2-weight columns)", "1001 (adding the 8 and 1-weight columns only)", "0101 (adding the 4 and 1-weight columns only)"], hint: "4 + 2 + 1.", why: "7 is composed of one 4, one 2, and one 1." },
    { q: "Why do computers struggle with precise Denary decimals?", a: "Some fractions cannot be perfectly represented in binary", options: ["Some fractions cannot be perfectly represented in binary", "The processor cannot perform division on large numbers", "The monitor cannot display more than two decimal points", "The system memory is too small to hold fractional data"], hint: "Floating point errors.", why: "Binary fractions (1/2, 1/4, 1/8) cannot always sum exactly to denary decimals like 0.1." },
    { q: "What is 'MSB' in the context of binary numbers?", a: "Most Significant Bit (the bit with the highest weight)", options: ["Most Significant Bit (the bit with the highest weight)", "Main System Bus (the pathway for data transfer)", "Memory Storage Block (a unit of allocated RAM)", "Minimum Standard Binary (the simplest bit format)"], hint: "The leftmost bit.", why: "The MSB is the leftmost bit and carries the highest value." },
    { q: "Which number base do computers use internally?", a: "Base 2 (binary)", options: ["Base 2 (binary)", "Base 10 (denary)", "Base 16 (hexadecimal)", "Base 8 (octal)"], hint: "Two states.", why: "Transistors are either on or off, which maps directly onto 1 and 0." },
    { q: "How many digits does hexadecimal use?", a: "16", options: ["16", "10", "2", "8"], hint: "0-9 then A-F.", why: "The letters A to F represent the values 10 to 15." },
    { q: "What is the denary value of the hex digit C?", a: "12", options: ["12", "11", "13", "10"], hint: "A is 10.", why: "A=10, B=11, C=12, and so on to F=15." },
    { q: "Why do programmers prefer hexadecimal to long binary strings?", a: "It is shorter and less error-prone to read", options: ["It is shorter and less error-prone to read", "Computers process hex more quickly", "Hex uses less memory than binary", "Hex can represent negative numbers"], hint: "Fewer characters.", why: "One hex digit replaces four binary digits, so 8 bits become just 2 characters." },
    { q: "How many binary digits does one hex digit represent?", a: "4", options: ["4", "2", "8", "16"], hint: "A nibble.", why: "Four bits give 16 combinations, exactly matching one hex digit." },
    { q: "What is the largest value one denary digit can hold?", a: "9", options: ["9", "10", "1", "15"], hint: "Base 10 digits.", why: "Denary digits run 0 to 9 before carrying into the next column." },
    { q: "What does the base of a number system tell you?", a: "How many different digits it uses", options: ["How many different digits it uses", "How many bits each number takes", "How large numbers can be", "How many columns are allowed"], hint: "Count the symbols.", why: "Base 2 has two symbols, base 16 has sixteen." },
    { q: "Which of these is a valid hexadecimal number?", a: "3F", options: ["3F", "3G", "2H", "19K"], hint: "Only A to F.", why: "Letters beyond F are not hexadecimal digits." },
    { q: "What are the column headings for a 4-bit binary number?", a: "8, 4, 2, 1", options: ["8, 4, 2, 1", "1, 2, 3, 4", "10, 100, 1000, 10000", "16, 8, 4, 2"], hint: "Powers of two.", why: "Each column is double the one to its right." },
    { q: "What is the largest value 4 bits can represent?", a: "15", options: ["15", "16", "8", "31"], hint: "8+4+2+1.", why: "All four bits set gives 15, so the range is 0 to 15." },
    { q: "Why is base 16 convenient for representing colours?", a: "Each colour channel fits neatly into two hex digits", options: ["Each colour channel fits neatly into two hex digits", "Hex numbers are always brighter", "There are exactly 16 colours available", "Hex avoids the need for binary"], hint: "Two digits per byte.", why: "A colour such as #FF8800 gives one byte to each of red, green and blue." },
    { q: "What is the denary value of hexadecimal F?", a: "15", options: ["15", "16", "14", "10"], hint: "The last hex digit.", why: "F is the highest single hex digit, worth 15." },
    { q: "How many values can 8 bits represent?", a: "256", options: ["256", "255", "128", "64"], hint: "Two to the power eight.", why: "256 different patterns, giving the range 0 to 255." },
    { q: "Why can binary get long for large numbers?", a: "Only two digits are available, so more columns are needed", options: ["Only two digits are available, so more columns are needed", "Binary numbers include letters", "Binary always uses 64 bits", "Binary cannot represent large numbers"], hint: "Fewer symbols, more columns.", why: "Denary 255 needs three digits but binary needs eight." },
    { q: "Which base is used to write memory addresses in documentation?", a: "Hexadecimal", options: ["Hexadecimal", "Denary", "Binary", "Base 5"], hint: "Compact and readable.", why: "Hex keeps addresses short while still mapping cleanly onto bits." }
  ],

  "3.3.2 Converting between bases": [
    { q: "How do you convert Hexadecimal to Binary efficiently?", a: "Convert each individual Hex digit into its own 4-bit nibble", options: ["Convert each individual Hex digit into its own 4-bit nibble", "Multiply the Hex value by sixteen and then divide by two", "Convert the Hex to Denary first and then into Binary", "Add a zero to the end of the Hex value and then shift"], hint: "Nibbles.", why: "Because one Hex digit is exactly 4 bits, you can translate them directly." },
    { q: "What is binary 1100 in Hexadecimal?", a: "C (the character representing Denary twelve)", options: ["C (the character representing Denary twelve)", "B (the character representing Denary eleven)", "A (the character representing Denary ten)", "D (the character representing Denary thirteen)"], hint: "8 + 4 = 12.", why: "1100 is 12 in denary, which is 'C' in Hex." },
    { q: "What is binary 1111 1111 in Denary?", a: "255 (the maximum value for an 8-bit byte)", options: ["255 (the maximum value for an 8-bit byte)", "256 (the total number of possible combinations)", "128 (the weight of the most significant bit)", "100 (a standard rounded numerical value)"], hint: "All bits on.", why: "The sum of 128+64+32+16+8+4+2+1 is 255." },
    { q: "What is Hexadecimal '1A' in Denary?", a: "26 (one sixteen plus ten ones)", options: ["26 (one sixteen plus ten ones)", "110 (one hundred plus ten ones)", "17 (one sixteen plus one one)", "32 (two sixteens and zero ones)"], hint: "16 + 10.", why: "The '1' is in the 16s column, the 'A' (10) is in the 1s column." },
    { q: "Convert binary 0011 0101 to Hexadecimal.", a: "35 (converting the two nibbles separately)", options: ["35 (converting the two nibbles separately)", "31 (calculating the total denary value)", "53 (reversing the order of the nibbles)", "8 (adding the two nibbles together)"], hint: "0011 | 0101.", why: "0011 is 3 and 0101 is 5." },
    { q: "What is the first step to convert Denary to Binary?", a: "Find the largest power of two that fits into the number", options: ["Find the largest power of two that fits into the number", "Divide the Denary number by sixteen and note the remainder", "Multiply the Denary number by two until it reaches zero", "Add a binary prefix to the front of the Denary number"], hint: "Subtraction method.", why: "The subtraction method starts by comparing the number to the highest column weight (e.g., 128)." },
    { q: "Convert Denary 50 to Binary.", a: "0011 0010 (32 + 16 + 2)", options: ["0011 0010 (32 + 16 + 2)", "0010 1010 (32 + 8 + 2)", "0011 0100 (32 + 16 + 4)", "0110 0010 (64 + 32 + 2)"], hint: "Find the components.", why: "50 = 32 + 16 + 2." },
    { q: "What is Hexadecimal 'FF' in Denary?", a: "255 (fifteen sixteens plus fifteen ones)", options: ["255 (fifteen sixteens plus fifteen ones)", "256 (sixteen sixteens and zero ones)", "100 (a standard base-10 conversion)", "1515 (concatenating the digit values)"], hint: "15*16 + 15.", why: "F is 15. (15 * 16) + (15 * 1) = 255." },
    { q: "Convert binary 0000 1010 to Denary.", a: "10 (adding the 8-weight and 2-weight columns)", options: ["10 (adding the 8-weight and 2-weight columns)", "12 (adding the 8-weight and 4-weight columns)", "5 (adding the 4-weight and 1-weight columns)", "8 (representing the most significant bit)"], hint: "8 + 2.", why: "Columns are ... 8, 4, 2, 1. The 8 and 2 columns are 'on'." },
    { q: "Convert Hexadecimal '2B' to Binary.", a: "0010 1011 (converting 2 and B separately)", options: ["0010 1011 (converting 2 and B separately)", "0010 1100 (converting 2 and C separately)", "1011 0010 (reversing the nibble order)", "0011 1010 (non-standard digit conversion)"], hint: "2 | B(11).", why: "2 = 0010 and B(11) = 1011." },
    { q: "What is the binary for Denary 128?", a: "1000 0000 (only the 128-weight bit is on)", options: ["1000 0000 (only the 128-weight bit is on)", "0111 1111 (all bits below 128 are on)", "1111 1111 (all 8-bits are currently on)", "0000 0001 (only the 1-weight bit is on)"], hint: "The MSB only.", why: "128 is the exact weight of the 8th bit in a byte." },
    { q: "How many Hex digits are needed for an 8-bit byte?", a: "2 digits (each covering a 4-bit nibble)", options: ["2 digits (each covering a 4-bit nibble)", "1 digit (covering the entire 8-bit block)", "4 digits (covering 2 bits per character)", "8 digits (covering 1 bit per character)"], hint: "Half of 8.", why: "8 bits / 4 bits per hex digit = 2 hex digits." },
    { q: "Convert Denary 15 to Hexadecimal.", a: "F (the single digit representing fifteen)", options: ["F (the single digit representing fifteen)", "15 (retaining the denary format)", "E (representing the value fourteen)", "10 (representing the value sixteen)"], hint: "The last hex digit.", why: "15 is the highest value a single hex digit can represent." },
    { q: "What is the binary 0101 0101 in Denary?", a: "85 (64 + 16 + 4 + 1)", options: ["85 (64 + 16 + 4 + 1)", "42 (32 + 8 + 2)", "170 (128 + 32 + 8 + 2)", "255 (all bits set to one)"], hint: "64+16+4+1.", why: "Add the weights of the columns that contain a '1'." },
    { q: "Convert Denary 20 to Hexadecimal.", a: "14 (one sixteen and four ones)", options: ["14 (one sixteen and four ones)", "20 (retaining the denary digits)", "1A (one sixteen and ten ones)", "12 (one sixteen and two ones)"], hint: "16 + 4.", why: "20 / 16 = 1 remainder 4. So, 14." },
    { q: "What is binary 1010 in denary?", a: "10", options: ["10", "12", "8", "5"], hint: "8 + 2.", why: "The 8 and 2 columns are set, giving 10." },
    { q: "What is denary 20 in binary using 8 bits?", a: "00010100", options: ["00010100", "00010010", "00011000", "00101000"], hint: "16 + 4.", why: "Setting the 16 and 4 columns gives 20." },
    { q: "What is hexadecimal 2A in denary?", a: "42", options: ["42", "26", "30", "44"], hint: "2 x 16 + 10.", why: "The 2 is worth 32 and A is worth 10." },
    { q: "What is binary 11111111 in denary?", a: "255", options: ["255", "256", "128", "254"], hint: "All eight bits set.", why: "128+64+32+16+8+4+2+1 totals 255." },
    { q: "How do you convert binary to hexadecimal?", a: "Split into groups of four bits and convert each", options: ["Split into groups of four bits and convert each", "Convert to denary first, then divide by 16", "Group the bits in threes", "Reverse the bits then convert"], hint: "Nibble at a time.", why: "Each nibble maps directly onto one hex digit." },
    { q: "What is binary 1100 0011 in hexadecimal?", a: "C3", options: ["C3", "3C", "B3", "C4"], hint: "1100 then 0011.", why: "1100 is C and 0011 is 3." },
    { q: "What is denary 200 in hexadecimal?", a: "C8", options: ["C8", "B8", "D8", "C9"], hint: "200 DIV 16 is 12.", why: "12 remainder 8 gives C then 8." },
    { q: "What is hexadecimal FF in denary?", a: "255", options: ["255", "256", "240", "15"], hint: "15 x 16 + 15.", why: "This is the largest value two hex digits can hold." },
    { q: "What is the result of adding binary 0101 and 0011?", a: "1000", options: ["1000", "0111", "1010", "1001"], hint: "5 + 3.", why: "The carries propagate to give 8, which is 1000." },
    { q: "What happens when a binary addition needs a ninth bit in 8-bit storage?", a: "An overflow error occurs", options: ["An overflow error occurs", "The extra bit is stored elsewhere", "The number is rounded down", "The result becomes negative"], hint: "No room.", why: "The result cannot be represented in the available bits." },
    { q: "What is binary 0110 1001 in denary?", a: "105", options: ["105", "106", "96", "69"], hint: "64+32+8+1.", why: "Adding the set columns gives 105." },
    { q: "What is a left shift of one place equivalent to?", a: "Multiplying by 2", options: ["Multiplying by 2", "Dividing by 2", "Adding 1", "Subtracting 2"], hint: "Everything moves up a column.", why: "Each bit moves to a column worth double, so the value doubles." },
    { q: "What is a right shift of two places equivalent to?", a: "Dividing by 4", options: ["Dividing by 4", "Multiplying by 4", "Dividing by 2", "Multiplying by 2"], hint: "Two halvings.", why: "Each shift halves the value, so two shifts divide by four." },
    { q: "What can be lost during a right shift?", a: "The least significant bits shifted off the end", options: ["The least significant bits shifted off the end", "The most significant bit only", "Nothing is ever lost", "The entire number"], hint: "Bits fall off the right.", why: "Shifting 0101 right gives 0010, losing the remainder." },
    { q: "What is denary 5 in binary using 4 bits?", a: "0101", options: ["0101", "1010", "0110", "1001"], hint: "4 + 1.", why: "The 4 and 1 columns are set." }
  ],

  "3.3.3 Units of information": [
    { q: "What is the smallest unit of data in a computer?", a: "Bit", options: ["Bit", "Byte", "Nibble", "Kilobyte"], hint: "Binary Digit.", why: "A bit is a single 0 or 1." },
    { q: "How many bits are in a kilobyte (KB), using the definition AQA uses?", a: "8000 bits (based on 1000 bytes)", options: ["8000 bits (based on 1000 bytes)", "1024 bits", "1000 bits", "8192 bits"], hint: "8 bits * 1000.", why: "AQA defines 1 kilobyte as 1000 bytes, so 1000 × 8 = 8000 bits. 1024 bytes is a kibibyte (KiB)." },
    { q: "How many Megabytes (MB) are in 1 Gigabyte (GB)?", a: "1000", options: ["1000", "1024", "100", "500"], hint: "Prefix for billion / million.", why: "In SI units used in exams, 1000 MB = 1 GB." },
    { q: "What is the correct order of size from smallest to largest?", a: "Bit, Nibble, Byte, Kilobyte", options: ["Bit, Nibble, Byte, Kilobyte", "Bit, Byte, Nibble, Kilobyte", "Byte, Bit, Nibble, Kilobyte", "Kilobyte, Byte, Nibble, Bit"], hint: "B, N, B, K.", why: "Bit (1), Nibble (4), Byte (8)." },
    { q: "How many bits are in 2 bytes?", a: "16", options: ["16", "8", "32", "4"], hint: "2 * 8.", why: "Each byte is 8 bits." },
    { q: "Which unit is approximately 1,000,000 bytes?", a: "Megabyte (MB)", options: ["Megabyte (MB)", "Kilobyte (KB)", "Gigabyte (GB)", "Terabyte (TB)"], hint: "Million.", why: "Mega- is the prefix for one million." },
    { q: "Which unit is approximately 1,000,000,000 bytes?", a: "Gigabyte (GB)", options: ["Gigabyte (GB)", "Megabyte (MB)", "Terabyte (TB)", "Petabyte (PB)"], hint: "Billion.", why: "Giga- is the prefix for one billion." },
    { q: "How many nibbles are in 1 byte?", a: "2", options: ["2", "4", "8", "1"], hint: "Half + Half.", why: "A nibble is 4 bits; a byte is 8 bits." },
    { q: "What comes after Terabyte (TB)?", a: "Petabyte (PB)", options: ["Petabyte (PB)", "Gigabyte (GB)", "Exabyte (EB)", "Zettabyte (ZB)"], hint: "P...", why: "The sequence is KB, MB, GB, TB, PB." },
    { q: "How many bits are in a nibble?", a: "4", options: ["4", "8", "2", "16"], hint: "Half a byte.", why: "A nibble is a 4-bit aggregation." },
    { q: "1000 Kilobytes is equal to...?", a: "1 Megabyte", options: ["1 Megabyte", "1 Gigabyte", "100 bytes", "1 Terabyte"], hint: "Next unit up.", why: "1000 KB = 1 MB." },
    { q: "Why do computers use binary units?", a: "To reflect the underlying hardware logic", options: ["To reflect the underlying hardware logic", "Because it is easier to say", "To save money", "To make files smaller"], hint: "On/Off states.", why: "Computers are made of switches that understand two states." },
    { q: "What is the symbol for a bit?", a: "b (lowercase)", options: ["b (lowercase)", "B (uppercase)", "bt", "bit"], hint: "Lowercase.", why: "Lowercase 'b' is bit; uppercase 'B' is byte." },
    { q: "What is the symbol for a byte?", a: "B (uppercase)", options: ["B (uppercase)", "b (lowercase)", "BY", "byte"], hint: "Uppercase.", why: "By convention, B represents a byte." },
    { q: "A Terabyte is approximately how many Gigabytes?", a: "1000", options: ["1000", "1024", "100", "10"], hint: "Standard scale.", why: "1000 GB = 1 TB." },
    { q: "How many bits are in a byte?", a: "8", options: ["8", "4", "16", "1024"], hint: "Two nibbles.", why: "A byte of 8 bits can hold 256 different values." },
    { q: "How many bytes are in a kilobyte?", a: "1000", options: ["1000", "1024", "100", "8"], hint: "AQA uses powers of ten.", why: "The specification defines 1 kB as 1,000 bytes." },
    { q: "Which is the smallest unit of data?", a: "Bit", options: ["Bit", "Byte", "Nibble", "Kilobyte"], hint: "A single 1 or 0.", why: "Everything larger is built from bits." },
    { q: "Put these in ascending order: GB, KB, TB, MB.", a: "KB, MB, GB, TB", options: ["KB, MB, GB, TB", "KB, GB, MB, TB", "MB, KB, GB, TB", "TB, GB, MB, KB"], hint: "Each is 1000 times the last.", why: "Kilo, mega, giga, tera each multiply by a thousand." },
    { q: "How many megabytes are in a gigabyte?", a: "1000", options: ["1000", "1024", "100", "10"], hint: "Same factor each step.", why: "The specification uses a factor of 1,000 between units." },
    { q: "Why is data measured in bits rather than characters?", a: "All data types reduce to bits in storage", options: ["All data types reduce to bits in storage", "Characters vary in size between languages", "Bits are easier for humans to read", "Characters cannot be counted"], hint: "Everything is bits.", why: "Images, sound and text all become binary in the end." },
    { q: "Roughly how many bytes would 10 kilobytes be?", a: "10,000", options: ["10,000", "1,000", "100,000", "1,024"], hint: "Multiply by 1000.", why: "Ten thousand bytes is ten kilobytes." },
    { q: "Which unit is largest?", a: "Terabyte", options: ["Terabyte", "Gigabyte", "Megabyte", "Kilobyte"], hint: "Tera is the biggest here.", why: "A terabyte is a thousand gigabytes." },
    { q: "Why does file size matter when sending data over a network?", a: "Larger files take longer to transfer", options: ["Larger files take longer to transfer", "Larger files are always corrupted", "Small files cannot be sent", "File size does not affect transfer"], hint: "Bandwidth is limited.", why: "Transfer time depends on file size and available bandwidth." },
    { q: "How many bits would 3 bytes be?", a: "24", options: ["24", "3", "8", "16"], hint: "Three lots of eight.", why: "Each byte is eight bits." },
    { q: "What is the correct symbol for a megabyte?", a: "MB", options: ["MB", "Mb", "mB", "MBy"], hint: "Capital B means bytes.", why: "A lower-case b means bits, which is eight times smaller." },
    { q: "A 2 MB file is sent over a 1 MB per second link. How long?", a: "About 2 seconds", options: ["About 2 seconds", "About 1 second", "About 4 seconds", "About half a second"], hint: "Size divided by rate.", why: "Two megabytes at one megabyte per second takes two seconds." },
    { q: "Why do storage makers use powers of ten?", a: "It matches the standard meaning of kilo, mega and giga", options: ["It matches the standard meaning of kilo, mega and giga", "It makes drives appear smaller", "Powers of two cannot be measured", "It is required by the operating system"], hint: "Kilo means thousand.", why: "This is why a drive sold as 500 GB shows less in some operating systems." },
    { q: "How many bytes could store 16 characters of ASCII text?", a: "16", options: ["16", "8", "32", "128"], hint: "One byte each.", why: "Extended ASCII uses one byte per character." },
    { q: "How many kilobytes are in a megabyte?", a: "1000", options: ["1000", "1024", "100", "8"], hint: "Same factor throughout.", why: "Each step up multiplies by a thousand." }
  ],

  "3.3.4 Character encoding": [
    { q: "What is the primary purpose of a 'Character Set'?", a: "To map unique binary codes to specific visual symbols", options: ["To map unique binary codes to specific visual symbols", "To compress text files to reduce total storage space", "To encrypt sensitive data for secure network transfer", "To translate high-level code into machine instructions"], hint: "Encoding map.", why: "Character sets ensure computers represent text consistently using binary." },
    { q: "How many characters can standard 7-bit ASCII represent?", a: "128 (calculated as 2 to the power of 7 combinations)", options: ["128 (calculated as 2 to the power of 7 combinations)", "256 (calculated as 2 to the power of 8 combinations)", "64 (calculated as 2 to the power of 6 combinations)", "1024 (calculated as 2 to the power of 10 combinations)"], hint: "2^7.", why: "7 bits allow for 128 unique binary patterns for characters." },
    { q: "Why was 'Unicode' developed to replace ASCII?", a: "To represent characters from all global languages", options: ["To represent characters from all global languages", "To make the central processor execute text faster", "To reduce the amount of RAM needed for text storage", "To prevent logic errors occurring in string handling"], hint: "Global symbols.", why: "Unicode uses more bits (usually 16 or 32) to store thousands of characters." },
    { q: "What is a significant disadvantage of using Unicode?", a: "It requires more storage space per character than ASCII", options: ["It requires more storage space per character than ASCII", "It is unable to represent standard English characters", "It cannot be processed by modern computer hardware", "It causes the system to run out of electrical power"], hint: "File size.", why: "Because it uses 16+ bits instead of 7 or 8, file sizes increase." },
    { q: "In character sets, what is an 'Extended ASCII'?", a: "An 8-bit version representing 256 unique characters", options: ["An 8-bit version representing 256 unique characters", "A 16-bit version designed for complex Asian symbols", "A 4-bit version used for simple numerical digit storage", "A version that only functions on modern cloud servers"], hint: "8 bits.", why: "Extended ASCII added one bit to allow for 128 extra symbols." },
    { q: "How are characters ordered in a character set?", a: "In a continuous sequence based on their binary value", options: ["In a continuous sequence based on their binary value", "In a random order to improve the system security", "By the frequency of their use in the English language", "By the physical size of the character on the monitor"], hint: "A comes before B.", why: "Characters are mapped to binary values in order (e.g., A=65, B=66)." },
    { q: "What happens if a character is not in the character set?", a: "The system displays a placeholder symbol or box", options: ["The system displays a placeholder symbol or box", "The entire computer hardware will instantly crash", "The system will automatically download a new set", "The character is replaced by a random integer value"], hint: "The 'missing' symbol.", why: "If the binary code is not mapped, the computer cannot render it." },
    { q: "Which character set is a subset of Unicode?", a: "ASCII (making it compatible with older systems)", options: ["ASCII (making it compatible with older systems)", "Hexadecimal (representing base-16 numerical data)", "Binary (representing base-2 electrical signals)", "Extended ASCII (representing 256 European symbols)"], hint: "First 128 are the same.", why: "Unicode kept ASCII as its first 128 characters for compatibility." },
    { q: "What is the ASCII value of 'A' if 'B' is 66?", a: "65 (one value lower in the sequential mapping)", options: ["65 (one value lower in the sequential mapping)", "67 (one value higher in the sequential mapping)", "97 (the value used for lowercase 'a' characters)", "1 (representing the first letter of the alphabet)"], hint: "Sequential order.", why: "Character sets map letters to numbers in alphabetical order." },
    { q: "What is the ASCII value of 'b' if 'a' is 97?", a: "98 (one value higher in the sequential mapping)", options: ["98 (one value higher in the sequential mapping)", "96 (one value lower in the sequential mapping)", "66 (the value used for uppercase 'B' characters)", "2 (representing the second letter of the alphabet)"], hint: "Sequential order.", why: "Lowercase characters follow their own sequence in ASCII." },
    { q: "A 'Control Character' in ASCII is used to...?", a: "Perform an action like a line break or carriage return", options: ["Perform an action like a line break or carriage return", "Represent a mathematical digit from zero to nine", "Store a secret password for the system administrator", "Change the font style of the text on the monitor"], hint: "Non-printing characters.", why: "Control characters (0-31) tell the hardware to do something (like beep)." },
    { q: "How many bits are used by UTF-8 for basic symbols?", a: "8 bits (allowing for efficient standard text storage)", options: ["8 bits (allowing for efficient standard text storage)", "16 bits (allowing for thousands of global symbols)", "32 bits (allowing for millions of emoji characters)", "4 bits (allowing for simple numerical data storage)"], hint: "Single byte.", why: "UTF-8 is variable length but uses 8 bits for the standard set." },
    { q: "Which character set is best for emojis and symbols?", a: "Unicode (specifically the UTF-32 encoding standard)", options: ["Unicode (specifically the UTF-32 encoding standard)", "ASCII (which only supports standard English text)", "Binary (which only supports basic numerical states)", "Denary (which only supports base-10 numerical data)"], hint: "Rich symbols.", why: "Unicode's large bit-depth allows for thousands of modern symbols." },
    { q: "What is the relationship between 'A' and 'a' in ASCII?", a: "They have different binary values (separated by 32)", options: ["They have different binary values (separated by 32)", "They share the exact same binary value in memory", "They are stored in the same memory address location", "They are considered identical by the central processor"], hint: "Case sensitivity.", why: "Uppercase and lowercase have distinct codes to allow for sorting." },
    { q: "Why do we use standards like ASCII and Unicode?", a: "To ensure data can be exchanged between different systems", options: ["To ensure data can be exchanged between different systems", "To make the computer consume less electrical energy", "To prevent the user from making complex syntax errors", "To reduce the total number of bits required for binary"], hint: "Compatibility.", why: "Standards allow a file created on one PC to look the same on another." },
    { q: "How many bits does standard ASCII use per character?", a: "7", options: ["7", "8", "16", "4"], hint: "128 characters.", why: "Seven bits give 128 codes, enough for English letters, digits and symbols." },
    { q: "Why was Unicode developed?", a: "To represent characters from every language", options: ["To represent characters from every language", "To make files smaller than ASCII", "To replace binary with denary", "To encrypt text automatically"], hint: "Global coverage.", why: "ASCII could not cover Chinese, Arabic or emoji." },
    { q: "What is a character set?", a: "An agreed mapping of characters to binary codes", options: ["An agreed mapping of characters to binary codes", "A list of fonts installed on a computer", "The set of keys on a keyboard", "A collection of text files"], hint: "Character to number.", why: "Both sender and receiver must use the same set to read text correctly." },
    { q: "If 'A' is 65, what is the code for 'C'?", a: "67", options: ["67", "66", "68", "65"], hint: "Letters are consecutive.", why: "Sequential codes make sorting and case conversion simple arithmetic." },
    { q: "If 'a' is 97, what is the code for 'b'?", a: "98", options: ["98", "97", "96", "99"], hint: "One higher.", why: "Lowercase letters are also consecutive." },
    { q: "What is the main drawback of Unicode compared with ASCII?", a: "It uses more bits per character", options: ["It uses more bits per character", "It cannot represent English letters", "It is not supported by any language", "It cannot be stored in a file"], hint: "More codes, more bits.", why: "Wider coverage costs storage, though encodings like UTF-8 reduce this." },
    { q: "What is the difference between the codes for 'A' and 'a'?", a: "32", options: ["32", "1", "26", "65"], hint: "65 versus 97.", why: "The fixed gap makes case conversion a simple addition or subtraction." },
    { q: "Why are digits given character codes as well as numeric values?", a: "So they can appear inside text such as postcodes", options: ["So they can appear inside text such as postcodes", "So they can be used in arithmetic", "So they take up less space", "So they can be encrypted"], hint: "'7' is not 7.", why: "The character '7' has a code; the number 7 is stored as binary 111." },
    { q: "How many characters can extended ASCII represent?", a: "256", options: ["256", "128", "65,536", "64"], hint: "Eight bits.", why: "The extra bit doubles the available codes to 256." },
    { q: "Why do the codes for letters run in alphabetical order?", a: "It makes sorting text straightforward", options: ["It makes sorting text straightforward", "It reduces the file size", "It is required by Unicode only", "It allows letters to be added together"], hint: "Compare the numbers.", why: "Sorting words becomes a numeric comparison of their codes." },
    { q: "What happens if text is opened with the wrong character set?", a: "Characters may display as incorrect symbols", options: ["Characters may display as incorrect symbols", "The file is deleted automatically", "The text is encrypted", "Nothing changes at all"], hint: "Mismatched mapping.", why: "The same binary is decoded against a different table, producing gibberish." },
    { q: "Which requires more storage: 100 ASCII characters or 100 Unicode ones?", a: "The Unicode text, if a wider encoding is used", options: ["The Unicode text, if a wider encoding is used", "The ASCII text", "They always use exactly the same space", "Neither uses any storage"], hint: "More bits per character.", why: "Wider encodings need more bits for each character." },
    { q: "What is stored in memory for the character 'Z'?", a: "A binary number representing its character code", options: ["A binary number representing its character code", "The shape of the letter as an image", "The word 'Zed' in text", "Nothing until it is printed"], hint: "A code, not a picture.", why: "The font decides how that code is drawn on screen." },
    { q: "Why does a space have its own character code?", a: "It is a character that must be stored like any other", options: ["It is a character that must be stored like any other", "Spaces are removed before storage", "It marks the end of a string", "Spaces are stored as zero bits"], hint: "It occupies a position.", why: "The space has code 32 in ASCII." },
    { q: "How would you convert 'd' to 'D' using character codes?", a: "Subtract 32 from its code", options: ["Subtract 32 from its code", "Add 32 to its code", "Multiply the code by 2", "Subtract 1 from its code"], hint: "Uppercase codes are lower.", why: "Uppercase letters sit 32 below their lowercase equivalents." }
  ],
  "3.3.5 Representing images": [
    { q: "What is a 'Pixel' in the context of digital images?", a: "A single point of colour in a larger bitmap image", options: ["A single point of colour in a larger bitmap image", "A type of compression used for high-definition video", "The physical resolution of the computer monitor screen", "A piece of software used for professional photo editing"], hint: "Picture element.", why: "A pixel is the smallest identifiable area of a bitmap image." },
    { q: "What is 'Resolution' in digital image processing?", a: "The total number of pixels that make up the image", options: ["The total number of pixels that make up the image", "The total number of colours available for each pixel", "The physical size of the image when it is printed", "The amount of compression applied to the image file"], hint: "Width x Height.", why: "Resolution is usually measured in pixels (e.g., 1920x1080)." },
    { q: "What is 'Colour depth' (or Bit depth)?", a: "The number of bits used to represent each pixel", options: ["The number of bits used to represent each pixel", "The total number of pixels found within the image", "The speed at which the image is displayed on screen", "The amount of memory needed to store the metadata"], hint: "Number of colours.", why: "Colour depth determines how many unique colours a pixel can be." },
    { q: "How many colours can a 1-bit image represent?", a: "2 (representing only two distinct logical states)", options: ["2 (representing only two distinct logical states)", "1 (representing only a single solid colour state)", "256 (representing a standard range of grey shades)", "16 (representing a basic palette of vivid colours)"], hint: "2^1.", why: "A bit can only be 0 or 1, allowing for two colours (usually black and white)." },
    { q: "How many bits are needed for 256 unique colours?", a: "8 bits (calculated as 2 to the power of 8)", options: ["8 bits (calculated as 2 to the power of 8)", "16 bits (calculated as 2 to the power of 16)", "4 bits (calculated as 2 to the power of 4)", "256 bits (one bit for every unique colour needed)"], hint: "2 to the power of what is 256?", why: "8 bits provide 256 combinations (2^8 = 256)." },
    { q: "What is 'Metadata' in an image file?", a: "Extra data stored about the image like its resolution", options: ["Extra data stored about the image like its resolution", "The actual binary codes for the individual pixels", "The type of hardware used to display the image", "The physical height and weight of the computer"], hint: "Data about data.", why: "Metadata tells the computer how to render the pixel data correctly." },
    { q: "What happens to a bitmap image when enlarged?", a: "The image becomes pixelated as the pixels stretch", options: ["The image becomes pixelated as the pixels stretch", "The image becomes clearer as more pixels are added", "The image changes its file format into a vector", "The image file size is automatically reduced by half"], hint: "Blurry blocks.", why: "Bitmaps have a fixed resolution; stretching them makes pixels visible." },
    { q: "Which of these is a common metadata item?", a: "The date and time the photograph was captured", options: ["The date and time the photograph was captured", "The specific binary code for the first pixel", "The total number of bits found in the entire byte", "The username of the person who created the file"], hint: "File info.", why: "Metadata commonly includes date, time, location, and camera settings." },
    { q: "How do you calculate the file size of an image?", a: "Multiply width x height x colour depth (in bits)", options: ["Multiply width x height x colour depth (in bits)", "Divide width by height and multiply by resolution", "Add the width and height and multiply by metadata", "Multiply the total pixels by the speed of the CPU"], hint: "W x H x Depth.", why: "This gives the total bits required to store every pixel's colour." },
    { q: "What is the result of 24-bit 'True Colour'?", a: "Over 16 million unique colour combinations", options: ["Over 16 million unique colour combinations", "Exactly 24 different shades of primary colours", "Over 1,000 different levels of grey brightness", "Exactly 16,777,216 individual pixels in the image"], hint: "2^24.", why: "24-bit colour allows for 16.7 million colours (True Colour)." },
    { q: "Why would you reduce the resolution of an image?", a: "To decrease the file size for faster web transfer", options: ["To decrease the file size for faster web transfer", "To make the image look much clearer on the screen", "To increase the total number of colours available", "To prevent the image from being copied by others"], hint: "Smaller file.", why: "Fewer pixels mean less data, which makes the file smaller." },
    { q: "What is a 'Vector' image compared to a bitmap?", a: "An image made of mathematical paths and shapes", options: ["An image made of mathematical paths and shapes", "An image made of a grid of individual colour dots", "An image that only contains black and white pixels", "An image that is stored in a compressed binary format"], hint: "Infinite zoom.", why: "Vectors use geometry rather than pixels, so they never lose quality." },
    { q: "A 2x2 image with 2-bit depth has how many bits?", a: "8 bits (calculated as 2 x 2 x 2 bits total)", options: ["8 bits (calculated as 2 x 2 x 2 bits total)", "4 bits (calculated as 2 x 2 pixels only)", "16 bits (calculated as 2 to the power of 4)", "2 bits (the depth of the entire image structure)"], hint: "Area x Depth.", why: "4 pixels * 2 bits each = 8 bits total." },
    { q: "What colour depth is needed for 16 colours?", a: "4 bits (calculated as 2 to the power of 4)", options: ["4 bits (calculated as 2 to the power of 4)", "2 bits (calculated as 2 to the power of 2)", "8 bits (calculated as 2 to the power of 8)", "16 bits (one bit for every unique colour needed)"], hint: "2^x = 16.", why: "4 bits allow for 16 combinations (0-15)." },
    { q: "Which colour model uses Red, Green, and Blue?", a: "RGB (mixing three light colours for pixels)", options: ["RGB (mixing three light colours for pixels)", "CMYK (mixing four ink colours for printing)", "Binary (mixing two logical states for data)", "Hex (using sixteen characters for colours)"], hint: "Screen colours.", why: "Screens use RGB light to create the full spectrum of colours." },
    { q: "What is a pixel?", a: "The smallest single point of colour in an image", options: ["The smallest single point of colour in an image", "A unit of file size", "The width of an image in centimetres", "A type of image file format"], hint: "Picture element.", why: "Bitmaps are grids of pixels, each storing a colour value." },
    { q: "What does colour depth mean?", a: "The number of bits used to store each pixel's colour", options: ["The number of bits used to store each pixel's colour", "The number of pixels across the image", "How dark the image appears", "The size of the image on screen"], hint: "Bits per pixel.", why: "More bits per pixel means more distinct colours are available." },
    { q: "How many colours can a colour depth of 1 bit represent?", a: "2", options: ["2", "1", "4", "8"], hint: "Two states.", why: "One bit gives black or white only." },
    { q: "How many colours can 8 bits per pixel represent?", a: "256", options: ["256", "128", "64", "1024"], hint: "Two to the power eight.", why: "Each extra bit doubles the number of available colours." },
    { q: "What is image resolution?", a: "The number of pixels in the image", options: ["The number of pixels in the image", "The number of colours available", "The physical size of the screen", "The file format used"], hint: "How many pixels.", why: "Higher resolution captures more detail but increases file size." },
    { q: "How do you calculate a bitmap's file size in bits?", a: "Width x height x colour depth", options: ["Width x height x colour depth", "Width + height + colour depth", "Width x height DIV colour depth", "Width x colour depth"], hint: "Pixels times bits each.", why: "Every pixel needs its colour depth in bits, plus a small header." },
    { q: "An image is 10 x 10 pixels at 4 bits per pixel. What is its size in bits?", a: "400", options: ["400", "100", "40", "1600"], hint: "100 pixels.", why: "100 pixels multiplied by 4 bits each gives 400 bits." },
    { q: "What happens to file size if resolution doubles in both directions?", a: "It roughly quadruples", options: ["It roughly quadruples", "It roughly doubles", "It stays the same", "It roughly halves"], hint: "Both dimensions grow.", why: "Twice the width and twice the height gives four times as many pixels." },
    { q: "What is metadata in an image file?", a: "Extra data about the image, such as its dimensions", options: ["Extra data about the image, such as its dimensions", "The colour of the first pixel", "A compressed copy of the image", "The name of the person viewing it"], hint: "Data about data.", why: "Without dimensions the computer could not reconstruct the pixel grid." },
    { q: "Why does a photograph look blocky when enlarged too far?", a: "Individual pixels become visible", options: ["Individual pixels become visible", "The colour depth decreases", "The metadata is lost", "The file becomes compressed"], hint: "Fixed number of pixels.", why: "Bitmaps have a set resolution, so enlarging just makes each pixel bigger." },
    { q: "How many bits are needed for 16 colours?", a: "4", options: ["4", "16", "8", "2"], hint: "Two to the power four.", why: "Four bits give exactly 16 combinations." },
    { q: "What is the effect of reducing colour depth?", a: "Smaller file size but less accurate colour", options: ["Smaller file size but less accurate colour", "Larger file size and better colour", "No change to size or quality", "The image becomes higher resolution"], hint: "A trade-off.", why: "Fewer bits per pixel means banding in gradients." },
    { q: "Which stores a black and white image most efficiently?", a: "1 bit per pixel", options: ["1 bit per pixel", "8 bits per pixel", "24 bits per pixel", "16 bits per pixel"], hint: "Only two colours needed.", why: "Extra bits would be wasted if only two colours appear." },
    { q: "An image is 100 x 50 pixels at 8 bits per pixel. Size in bytes?", a: "5,000", options: ["5,000", "40,000", "500", "1,000"], hint: "One byte per pixel.", why: "5,000 pixels at 8 bits each is 5,000 bytes." },
    { q: "Why do images include a header?", a: "To tell software how to interpret the pixel data", options: ["To tell software how to interpret the pixel data", "To make the file larger", "To store the image twice", "To encrypt the image"], hint: "Instructions for reading.", why: "Width, height and colour depth are needed before the pixels make sense." }
  ],
  "3.3.6 Representing sound": [
    { q: "How is sound captured by a computer?", a: "By sampling the amplitude of the sound wave", options: ["By sampling the amplitude of the sound wave", "By measuring the total length of the audio file", "By counting the number of speakers in the system", "By calculating the physical weight of the air"], hint: "Measuring waves.", why: "Analogue sound is sampled at regular intervals to create digital data." },
    { q: "What is the 'Sample rate' in digital audio?", a: "The number of samples taken per second (Hz)", options: ["The number of samples taken per second (Hz)", "The total number of bits used for each sample", "The volume of the sound at a specific moment", "The total length of the sound recording in seconds"], hint: "Frequency.", why: "A higher sample rate means the digital sound is closer to the original." },
    { q: "What is 'Sample resolution' (or Bit depth)?", a: "The number of bits used to store each sample", options: ["The number of bits used to store each sample", "The total number of samples taken every second", "The number of audio channels used in the file", "The speed at which the sound travels through air"], hint: "Quality of each point.", why: "Bit depth determines how accurately the volume is recorded." },
    { q: "How do you calculate the file size of sound?", a: "Sample rate x resolution x time (in seconds)", options: ["Sample rate x resolution x time (in seconds)", "Sample rate divided by time and bit depth", "Frequency multiplied by the number of speakers", "Volume multiplied by the length of the hardware"], hint: "Rate x Depth x Time.", why: "This formula calculates the total bits needed for the recording." },
    { q: "What happens if you increase the sample rate?", a: "The audio quality improves and file size increases", options: ["The audio quality improves and file size increases", "The audio quality decreases and file size stays the same", "The sound plays back much faster than the original", "The sound becomes completely silent to the user"], hint: "More points.", why: "More samples capture more detail but require more storage space." },
    { q: "What is the standard unit for sample rate?", a: "Hertz (Hz) representing cycles per second", options: ["Hertz (Hz) representing cycles per second", "Pixels (Px) representing dots on the screen", "Bits (B) representing logical binary states", "Metres (M) representing the length of the wave"], hint: "Cycles per second.", why: "Hz is the standard unit for frequency and sampling rate." },
    { q: "Why is an ADC needed for sound recording?", a: "To convert Analogue waves into Digital data", options: ["To convert Analogue waves into Digital data", "To convert Digital data into Analogue waves", "To compress the audio file for network transfer", "To increase the volume of the sound recorded"], hint: "A to D.", why: "Analogue-to-Digital Converters turn air vibrations into binary." },
    { q: "Why is a DAC needed for sound playback?", a: "To convert Digital data into Analogue waves", options: ["To convert Digital data into Analogue waves", "To convert Analogue waves into Digital data", "To display the sound wave on the monitor screen", "To reduce the file size of the audio recording"], hint: "D to A.", why: "Digital-to-Analogue Converters turn binary back into vibrations." },
    { q: "Standard CD quality is usually sampled at?", a: "44,100 Hz (forty-four thousand times a second)", options: ["44,100 Hz (forty-four thousand times a second)", "1,000 Hz (one thousand times every second)", "60 Hz (sixty times every single second)", "440 Hz (representing the musical note A)"], hint: "44.1 kHz.", why: "44.1 kHz is the standard for high-fidelity audio CDs." },
    { q: "What is a 'Sample' in digital audio?", a: "A measurement of the wave's height at a point", options: ["A measurement of the wave's height at a point", "A small clip of a popular song used in music", "A piece of software used to edit audio files", "A physical microphone used to capture sound"], hint: "Amplitude snapshot.", why: "A sample captures the amplitude of the wave at that exact millisecond." },
    { q: "Higher bit depth in sound allows for...?", a: "A greater dynamic range and less noise", options: ["A greater dynamic range and less noise", "The sound to be heard from a further distance", "The sound to play back at a much higher speed", "The audio file to be compressed more efficiently"], hint: "Dynamic range.", why: "More bits mean the volume levels are recorded with more precision." },
    { q: "Sound file size: 10Hz, 8-bit, 2s. What size?", a: "160 bits (10 x 8 x 2 bits total)", options: ["160 bits (10 x 8 x 2 bits total)", "80 bits (10 x 8 bits total size)", "20 bits (10 x 2 seconds total size)", "16 bits (8 bits x 2 seconds total size)"], hint: "Multiply all three.", why: "Rate(10) * Depth(8) * Time(2) = 160." },
    { q: "What is 'Lossy' audio compression?", a: "Removing data that the human ear cannot hear", options: ["Removing data that the human ear cannot hear", "Keeping every single bit of the original data", "Increasing the total sample rate of the file", "Adding extra metadata to the audio structure"], hint: "MP3.", why: "Lossy compression (like MP3) discards sounds we don't notice." },
    { q: "What is 'Lossless' audio compression?", a: "Reducing file size without losing any data", options: ["Reducing file size without losing any data", "Deleting the original audio wave completely", "Converting the sound into a bitmap image", "Removing high-frequency sounds from the file"], hint: "FLAC.", why: "Lossless (like FLAC) allows the original to be perfectly rebuilt." },
    { q: "Which format is typically Lossy?", a: "MP3 (designed for efficient web storage)", options: ["MP3 (designed for efficient web storage)", "WAV (designed for raw audio storage)", "FLAC (designed for high-fidelity storage)", "MIDI (designed for instrument instructions)"], hint: "Smallest file.", why: "MP3 uses lossy compression to make files small enough for phones." },
    { q: "What is sampling?", a: "Measuring the amplitude of a sound wave at regular intervals", options: ["Measuring the amplitude of a sound wave at regular intervals", "Compressing a sound file to save space", "Splitting a sound into separate channels", "Converting a sound into sheet music"], hint: "Take readings.", why: "Each measurement becomes a binary number stored in the file." },
    { q: "What is sample rate measured in?", a: "Hertz (samples per second)", options: ["Hertz (samples per second)", "Bits per sample", "Bytes per second", "Decibels"], hint: "How often per second.", why: "CD audio uses 44,100 samples per second." },
    { q: "What is sample resolution?", a: "The number of bits used for each sample", options: ["The number of bits used for each sample", "The number of samples per second", "The length of the recording", "The volume of the sound"], hint: "Bits per sample.", why: "More bits capture amplitude more precisely." },
    { q: "How do you calculate a sound file's size in bits?", a: "Sample rate x resolution x duration", options: ["Sample rate x resolution x duration", "Sample rate + resolution + duration", "Sample rate DIV resolution", "Resolution x duration only"], hint: "Multiply all three.", why: "Each second holds 'rate' samples, each needing 'resolution' bits." },
    { q: "What happens to quality if the sample rate increases?", a: "Quality improves but the file gets larger", options: ["Quality improves but the file gets larger", "Quality improves and the file gets smaller", "Quality falls and the file gets larger", "Nothing changes"], hint: "A trade-off.", why: "More frequent samples capture rapid changes in the wave more faithfully." },
    { q: "Why must sound be converted to digital form?", a: "Computers can only process discrete binary values", options: ["Computers can only process discrete binary values", "Analogue sound is always too quiet", "Digital sound uses less electricity", "Analogue sound cannot be heard"], hint: "Binary only.", why: "A continuous wave must be turned into a series of numbers." },
    { q: "A 10 second clip at 1,000 Hz and 8 bits. Size in bits?", a: "80,000", options: ["80,000", "10,000", "8,000", "800,000"], hint: "Multiply all three.", why: "1,000 x 8 x 10 gives 80,000 bits." },
    { q: "What causes a digital recording to sound less faithful than the original?", a: "Samples only approximate the continuous wave", options: ["Samples only approximate the continuous wave", "Digital files always lose data over time", "Computers cannot store loud sounds", "Binary cannot represent sound at all"], hint: "Steps, not a curve.", why: "Between samples the wave is unknown, so the shape is approximated." },
    { q: "Which gives the best quality?", a: "High sample rate and high resolution", options: ["High sample rate and high resolution", "Low sample rate and high resolution", "High sample rate and low resolution", "Low sample rate and low resolution"], hint: "Both high.", why: "Rate captures timing detail and resolution captures amplitude detail." },
    { q: "What is amplitude?", a: "The height of the sound wave, heard as volume", options: ["The height of the sound wave, heard as volume", "The number of samples per second", "The frequency of the sound", "The length of the recording"], hint: "How loud.", why: "Sampling records amplitude at each moment in time." },
    { q: "Doubling the sample rate has what effect on file size?", a: "It roughly doubles", options: ["It roughly doubles", "It roughly halves", "It stays the same", "It quadruples"], hint: "Twice as many samples.", why: "File size is directly proportional to sample rate." },
    { q: "Why might a podcast use a lower sample rate than music?", a: "Speech needs less detail, so smaller files are acceptable", options: ["Speech needs less detail, so smaller files are acceptable", "Speech cannot be sampled at high rates", "Higher rates make speech inaudible", "Podcasts must always be mono"], hint: "Fit for purpose.", why: "Voice occupies a narrower frequency range than music." },
    { q: "What does an analogue-to-digital converter do?", a: "Turns a continuous wave into binary samples", options: ["Turns a continuous wave into binary samples", "Turns binary samples back into sound", "Compresses a sound file", "Amplifies a quiet recording"], hint: "In through the microphone.", why: "Playback uses the reverse, a digital-to-analogue converter." },
    { q: "A 16-bit sample can record how many amplitude levels?", a: "65,536", options: ["65,536", "256", "16", "1,024"], hint: "Two to the power 16.", why: "More levels mean finer distinctions between quiet and loud." },
    { q: "Why does an uncompressed sound file get large quickly?", a: "Thousands of samples are stored every second", options: ["Thousands of samples are stored every second", "Sound needs more bits than images per sample", "Files store the sound twice for safety", "Every note is stored separately"], hint: "Rate times resolution.", why: "CD-quality audio uses over a megabyte for every ten seconds." }
  ],
  "3.3.7 Data compression": [
    { q: "What is the primary goal of data compression?", a: "To reduce file size for storage or transmission", options: ["To reduce file size for storage or transmission", "To make the central processor execute code faster", "To improve the visual quality of an image file", "To prevent a computer virus from infecting data"], hint: "Make it smaller.", why: "Compression saves disk space and makes downloads faster." },
    { q: "What is 'Lossy' compression?", a: "Permanently removing data to reduce file size", options: ["Permanently removing data to reduce file size", "Reducing file size without losing any data", "Increasing the resolution of an image file", "Adding extra metadata to a compressed file"], hint: "Quality loss.", why: "Lossy compression results in quality loss but very small files." },
    { q: "What is 'Lossless' compression?", a: "Reducing file size while keeping all original data", options: ["Reducing file size while keeping all original data", "Deleting data that the human eye cannot see", "Converting an image into a sound recording", "Making the file larger for higher quality"], hint: "Perfect rebuild.", why: "Lossless allows the original file to be perfectly reconstructed." },
    { q: "Which file type is best for Lossless compression?", a: "A database file containing financial records", options: ["A database file containing financial records", "A high-definition movie for streaming", "A photograph uploaded to a social network", "A background track for a video game"], hint: "Records must be exact.", why: "You cannot lose a single bit of text or numerical data." },
    { q: "Which file type is suitable for Lossy compression?", a: "A digital photograph or a music track", options: ["A digital photograph or a music track", "An executable programme file (.exe)", "A text document for a school report", "A zip file containing multiple projects"], hint: "Media files.", why: "Humans don't notice small losses in pixels or frequencies." },
    { q: "What is 'RLE' (Run Length Encoding)?", a: "Storing data as a value and a count", options: ["Storing data as a value and a count", "Replacing words with shorter binary codes", "Deleting the metadata from an image file", "Randomising the bits to save memory space"], hint: "AAAA becomes 4A.", why: "RLE is efficient for data with long runs of the same value." },
    { q: "Compress 'BBBBBAAA' using RLE.", a: "5B3A (indicating five Bs and three As)", options: ["5B3A (indicating five Bs and three As)", "B5A3 (indicating the value and the count)", "BA (simply listing the unique characters)", "8BA (listing the total and the values)"], hint: "Count then Value.", why: "RLE records the number of times a character repeats." },
    { q: "What is a 'Compression Ratio'?", a: "The size of the original file versus compressed", options: ["The size of the original file versus compressed", "The speed at which the file is compressed", "The number of errors found during compression", "The amount of power used during compression"], hint: "Original vs New.", why: "It measures how effective the compression has been." },
    { q: "What is 'Huffman Coding'?", a: "Using shorter codes for frequent data items", options: ["Using shorter codes for frequent data items", "Replacing all characters with 8-bit ASCII", "Removing the headers from a binary file", "Dividing the file into two identical halves"], hint: "Frequency based.", why: "Huffman trees give frequent characters short binary codes." },
    { q: "Which is a Lossless file format?", a: "PNG (supporting transparent backgrounds)", options: ["PNG (supporting transparent backgrounds)", "JPEG (supporting complex photography)", "MP3 (supporting audio recordings)", "MP4 (supporting video recordings)"], hint: "Graphics and text.", why: "PNG is a common lossless image format." },
    { q: "Which is a Lossy file format?", a: "JPEG (highly compressed photography)", options: ["JPEG (highly compressed photography)", "GIF (supporting basic animations)", "ZIP (supporting multiple file storage)", "FLAC (supporting high-fidelity audio)"], hint: "Photos.", why: "JPEG removes pixel detail to achieve small file sizes." },
    { q: "Why can't you use Lossy on a .exe file?", a: "Removing a single bit will break the code", options: ["Removing a single bit will break the code", "The file size would become too large to run", "The CPU cannot read compressed binary data", "The metadata would be lost during the process"], hint: "Execution needs precision.", why: "Software instructions must be 100% accurate to function." },
    { q: "What is the benefit of RLE for simple logos?", a: "It is very efficient for large areas of solid colour", options: ["It is very efficient for large areas of solid colour", "It allows the logo to be resized without losing quality", "It increases the total number of colours available", "It prevents the logo from being edited by others"], hint: "Solid blocks.", why: "Simple logos have many identical adjacent pixels." },
    { q: "What is a 'Dictionary' in compression?", a: "A table mapping short codes to long patterns", options: ["A table mapping short codes to long patterns", "A book used to check the spelling of the code", "A list of all variables used in the programme", "A hardware component used to store binary"], hint: "Substitution.", why: "Dictionary compression replaces repeating phrases with small indexes." },
    { q: "Why use ZIP files for email attachments?", a: "To group files and reduce total transfer time", options: ["To group files and reduce total transfer time", "To make the files unreadable to the recipient", "To increase the security of the local network", "To change the data types of the stored files"], hint: "Faster upload.", why: "ZIP uses lossless compression to shrink files for faster emailing." },
    { q: "What is the main purpose of compression?", a: "To reduce file size for storage and transmission", options: ["To reduce file size for storage and transmission", "To improve the quality of a file", "To encrypt a file for security", "To convert a file to a different format"], hint: "Make it smaller.", why: "Smaller files transfer faster and take less storage." },
    { q: "What is the key difference between lossy and lossless compression?", a: "Lossy discards data permanently; lossless keeps it all", options: ["Lossy discards data permanently; lossless keeps it all", "Lossless discards data; lossy keeps it all", "Lossy only works on text files", "Lossless always gives smaller files"], hint: "Can you get it back?", why: "Lossless can rebuild the original exactly; lossy cannot." },
    { q: "Which compression type suits a text document?", a: "Lossless", options: ["Lossless", "Lossy", "Either works equally well", "Neither can compress text"], hint: "Every character matters.", why: "Discarding characters would change the meaning of the document." },
    { q: "Why is lossy compression acceptable for streaming music?", a: "The discarded detail is barely noticeable to listeners", options: ["The discarded detail is barely noticeable to listeners", "Music files cannot be compressed losslessly", "Streaming requires data to be deleted", "Lossy compression improves sound quality"], hint: "Human hearing has limits.", why: "Frequencies we struggle to hear can be removed with little perceived loss." },
    { q: "What does run length encoding replace?", a: "Runs of repeated values with a count and the value", options: ["Runs of repeated values with a count and the value", "Common words with shorter codes", "Colours with their hex equivalents", "Every character with a 4-bit code"], hint: "Count the repeats.", why: "AAAA becomes 4A, which is far shorter." },
    { q: "What is RLE for the string BBBBCC?", a: "4B2C", options: ["4B2C", "B4C2", "6BC", "BBCC"], hint: "Count then character.", why: "Four Bs then two Cs." },
    { q: "When does RLE make a file larger?", a: "When there are few repeated values", options: ["When there are few repeated values", "When the file is already small", "When the file contains only text", "When the runs are very long"], hint: "ABC becomes 1A1B1C.", why: "Each single character becomes two, doubling the size." },
    { q: "Which file type is RLE best suited to?", a: "A simple image with large blocks of one colour", options: ["A simple image with large blocks of one colour", "A detailed photograph", "An encrypted archive", "A random number list"], hint: "Long runs.", why: "Logos and icons have big areas of identical pixels." },
    { q: "Is RLE lossy or lossless?", a: "Lossless", options: ["Lossless", "Lossy", "Both, depending on settings", "Neither"], hint: "Nothing is thrown away.", why: "The original can be rebuilt exactly by expanding the runs." },
    { q: "What is a benefit of compressing files before emailing them?", a: "They send faster and may fit within size limits", options: ["They send faster and may fit within size limits", "They become impossible to open", "They are automatically encrypted", "They gain extra detail"], hint: "Less data to send.", why: "Attachment limits and slow connections both favour smaller files." },
    { q: "Why can a compressed photo look blocky?", a: "Lossy compression has discarded fine detail", options: ["Lossy compression has discarded fine detail", "The resolution was increased", "The file was encrypted", "Metadata was removed"], hint: "Detail thrown away.", why: "Aggressive lossy settings produce visible artefacts." },
    { q: "What must be true to rebuild a file exactly?", a: "The compression must have been lossless", options: ["The compression must have been lossless", "The file must be an image", "The file must be under 1 MB", "The file must be compressed twice"], hint: "Nothing discarded.", why: "Lossy compression permanently removes data." },
    { q: "Which would you use for a legal contract?", a: "Lossless compression", options: ["Lossless compression", "Lossy compression", "No compression is possible", "Either is equally suitable"], hint: "Every word counts.", why: "Losing even one word could change the legal meaning." },
    { q: "How does compression help a video streaming service?", a: "Less bandwidth is needed per viewer", options: ["Less bandwidth is needed per viewer", "Videos play at a higher resolution", "Viewers need faster processors", "Videos become longer"], hint: "Bandwidth costs money.", why: "Compression is what makes streaming viable over ordinary connections." },
    { q: "What is decompression?", a: "Restoring a compressed file for use", options: ["Restoring a compressed file for use", "Making a file smaller a second time", "Deleting a compressed file", "Encrypting a compressed file"], hint: "The reverse process.", why: "The file must be expanded before it can be viewed or played." }
  ],
  "3.3.8 Huffman coding": [
    { q: "In Huffman Coding, which characters get the shortest codes?", a: "The characters that appear most frequently", options: ["The characters that appear most frequently", "The characters that appear at the start of text", "The characters that are capitalised in the file", "The characters with the highest ASCII values"], hint: "Save the most bits.", why: "Giving frequent characters short codes saves the most space." },
    { q: "What structure is used to generate Huffman codes?", a: "A binary tree built from frequencies", options: ["A binary tree built from frequencies", "A linear list of all possible characters", "A multidimensional array of integer values", "A record containing metadata and pixels"], hint: "A tree.", why: "A Huffman tree is built by combining the lowest frequencies." },
    { q: "Which character is likely to have code '0' in a book?", a: "The space character or the letter 'e'", options: ["The space character or the letter 'e'", "The letter 'z' or the letter 'q'", "The full stop or the comma symbol", "The first character of the first chapter"], hint: "The most common.", why: "Space and 'e' are usually the most frequent in English." },
    { q: "How do you build a Huffman tree?", a: "Combine the two nodes with the lowest frequency", options: ["Combine the two nodes with the lowest frequency", "Combine the two nodes with the highest frequency", "Add the characters in their alphabetical order", "Place all characters in a single vertical line"], hint: "Start small.", why: "Building from the bottom up ensures frequent items stay near the top." },
    { q: "In a Huffman tree, what does a left branch usually represent?", a: "A binary '0' in the character's code", options: ["A binary '0' in the character's code", "A binary '1' in the character's code", "The end of the entire character string", "An error identified within the coding tree"], hint: "0 or 1.", why: "Branches are labeled 0 and 1 to build the unique codes." },
    { q: "What is a 'Prefix-free' code?", a: "No code is the beginning of another code", options: ["No code is the beginning of another code", "All codes must start with a binary zero", "Every code must be exactly eight bits long", "Codes can only be used for numerical data"], hint: "No confusion.", why: "This ensures the computer knows exactly when one character ends." },
    { q: "If 'A' is 0, 'B' is 10, 'C' is 11. Decode '01110'.", a: "ACB (reading the bits from the tree)", options: ["ACB (reading the bits from the tree)", "ABC (reading the bits in order)", "BCA (reading the bits in reverse)", "AAA (reading only the first bit)"], hint: "0 | 11 | 10.", why: "0=A, 11=C, 10=B." },
    { q: "Why is Huffman better than 8-bit ASCII?", a: "It uses fewer total bits for the same message", options: ["It uses fewer total bits for the same message", "It is much easier for a human to read manually", "It prevents all possible data transmission errors", "It makes the computer processor run much faster"], hint: "Efficiency.", why: "By not using 8 bits for every character, it reduces file size." },
    { q: "Can two characters have the same Huffman code?", a: "No (every code in the tree must be unique)", options: ["No (every code in the tree must be unique)", "Yes (if they have the same frequency)"], hint: "Avoids confusion.", why: "Unique paths in the tree guarantee unique codes." },
    { q: "Huffman coding is an example of...?", a: "Lossless compression (data is perfectly kept)", options: ["Lossless compression (data is perfectly kept)", "Lossy compression (data is permanently lost)", "Data encryption (data is kept secret)", "Data sanitisation (data is cleaned of errors)"], hint: "Perfect reconstruction.", why: "The tree allows you to rebuild the text exactly as it was." },
    { q: "What data is needed to decode a Huffman file?", a: "The compressed bits and the Huffman tree", options: ["The compressed bits and the Huffman tree", "The original file size and the ASCII table", "The computer's name and the date of creation", "The password of the person who created it"], hint: "The map and the code.", why: "Without the specific tree used, the bits cannot be decoded." },
    { q: "Which bit length is NOT possible in Huffman?", a: "0 bits (every character must have a code)", options: ["0 bits (every character must have a code)", "1 bit (for the most frequent item)", "10 bits (for an extremely rare item)", "8 bits (matching the standard ASCII size)"], hint: "Must exist.", why: "Every character in the dataset must be represented in the tree." },
    { q: "What happens to the tree if frequencies change?", a: "The entire tree must be rebuilt for efficiency", options: ["The entire tree must be rebuilt for efficiency", "The tree remains the same regardless of data", "The tree is automatically deleted by the CPU", "The characters just swap their existing codes"], hint: "Customised for data.", why: "Huffman is most efficient when tailored to the specific file's frequencies." },
    { q: "In a tree with 4 items, what is the max code length?", a: "3 bits (in a very unbalanced tree)", options: ["3 bits (in a very unbalanced tree)", "8 bits (matching a standard binary byte)", "2 bits (calculated as 2 to the power of 2)", "4 bits (one bit for every unique character)"], hint: "Depth of the tree.", why: "An unbalanced tree with 4 nodes will have a path 3 deep." },
    { q: "Huffman coding is primarily used for?", a: "Text files and some image/audio formats", options: ["Text files and some image/audio formats", "Increasing the physical speed of the internet", "Organising the files on a secondary hard drive", "Preventing hardware failure in the central unit"], hint: "General data.", why: "It is a versatile tool used in ZIP, JPEG, and MP3 formats." },
    { q: "What is the principle behind Huffman coding?", a: "Frequent characters get shorter codes", options: ["Frequent characters get shorter codes", "Every character gets an 8-bit code", "Characters are stored alphabetically", "Repeated characters are deleted"], hint: "Common means short.", why: "Assigning short codes to common letters shortens the whole message." },
    { q: "Is Huffman coding lossy or lossless?", a: "Lossless", options: ["Lossless", "Lossy", "Both", "Neither"], hint: "Fully reversible.", why: "The tree lets the exact original text be reconstructed." },
    { q: "In a Huffman tree, what convention is used for branches?", a: "Left is 0 and right is 1", options: ["Left is 0 and right is 1", "Left is 1 and right is 0", "Both branches are 1", "Branches have no values"], hint: "Left then right.", why: "Following the branches from the root spells out each character's code." },
    { q: "Where do the least frequent characters sit in a Huffman tree?", a: "Deepest, furthest from the root", options: ["Deepest, furthest from the root", "Closest to the root", "At the root itself", "They are not included"], hint: "Longer path, longer code.", why: "Rare characters can afford longer codes because they appear seldom." },
    { q: "How is a Huffman tree built?", a: "By repeatedly combining the two lowest-frequency nodes", options: ["By repeatedly combining the two lowest-frequency nodes", "By combining the two highest-frequency nodes", "By adding characters in alphabetical order", "By splitting the alphabet in half"], hint: "Smallest two first.", why: "Combining the rarest first pushes them deepest into the tree." },
    { q: "What is a prefix-free code?", a: "No code is the start of any other code", options: ["No code is the start of any other code", "Every code has the same length", "Codes never begin with zero", "Codes are stored before the data"], hint: "No ambiguity.", why: "It means the decoder always knows where one character ends." },
    { q: "What must be stored alongside Huffman-compressed data?", a: "The tree or code table needed to decode it", options: ["The tree or code table needed to decode it", "The original uncompressed file", "A list of every character's position", "Nothing else is needed"], hint: "How to read it back.", why: "Without the mapping the bits cannot be turned back into characters." },
    { q: "A character appears once in a long message. What code length?", a: "One of the longest in the tree", options: ["One of the longest in the tree", "One of the shortest", "Exactly 8 bits", "Exactly 1 bit"], hint: "Rare goes deep.", why: "Rarity places it at the greatest depth from the root." },
    { q: "How do you work out the total bits for a Huffman-coded message?", a: "Multiply each code length by its frequency and total them", options: ["Multiply each code length by its frequency and total them", "Count the characters and multiply by 8", "Add the code lengths together once", "Count the nodes in the tree"], hint: "Length times frequency.", why: "Each occurrence costs its own code length in bits." },
    { q: "Why does Huffman coding beat fixed-length ASCII for most text?", a: "Common letters use fewer than 8 bits", options: ["Common letters use fewer than 8 bits", "It removes spaces from the text", "It stores only the vowels", "It uses 16 bits per character"], hint: "Uneven letter frequency.", why: "Letters like e and t dominate English, so shortening them saves a lot." },
    { q: "What sits at the leaves of a Huffman tree?", a: "The characters being encoded", options: ["The characters being encoded", "The combined frequency totals", "The binary codes only", "Nothing at all"], hint: "End of each path.", why: "Internal nodes hold totals; leaves hold the actual characters." },
    { q: "Decoding reaches a leaf. What happens next?", a: "That character is output and decoding restarts at the root", options: ["That character is output and decoding restarts at the root", "Decoding stops completely", "The next bit is skipped", "The tree is rebuilt"], hint: "Back to the top.", why: "Each character's code is traced independently from the root." },
    { q: "When is Huffman coding least effective?", a: "When every character appears equally often", options: ["When every character appears equally often", "When one character dominates", "When the message is very long", "When the text is in English"], hint: "No spread to exploit.", why: "With equal frequencies, all codes end up a similar length." },
    { q: "What does the number inside an internal node represent?", a: "The combined frequency of its two children", options: ["The combined frequency of its two children", "The character it encodes", "The depth of the node", "The number of bits in its code"], hint: "Add the children.", why: "Merging builds parent nodes whose value is the sum below them." },
    { q: "A message uses 3 characters coded in 2, 2 and 1 bits, appearing 5, 5 and 10 times. Total bits?", a: "30", options: ["30", "20", "40", "15"], hint: "Multiply then add.", why: "(5x2) + (5x2) + (10x1) gives 30 bits." }
  ],
  "3.4.1 Hardware and software": [
    { q: "What is the most accurate definition of 'Software'?", a: "The programmes and data that provide instructions for the hardware", options: ["The programmes and data that provide instructions for the hardware", "The physical internal components and circuitry of a computer system", "The electrical signals travelling through the motherboard copper tracks", "The peripheral devices used for manual input and visual data output"], hint: "Digital instructions.", why: "Software provides the logical instructions that tell the hardware what to do." },
    { q: "What is the most accurate definition of 'Hardware'?", a: "The physical components that make up a computer system", options: ["The physical components that make up a computer system", "The digital data stored within the secondary storage devices", "The set of rules governing how a programme should be written", "The invisible electrical signals processed by the control unit"], hint: "Physical parts.", why: "Hardware refers to any part of the computer you can physically touch." },
    { q: "What is the purpose of an 'Embedded System'?", a: "A computer built into a larger device for a specific task", options: ["A computer built into a larger device for a specific task", "A powerful server used to host complex websites and databases", "A desktop PC used by a person for general office productivity", "A type of software designed to protect against computer viruses"], hint: "Think of a microwave.", why: "Embedded systems are dedicated hardware/software combinations within larger machines." },
    { q: "Which of these is a characteristic of an Embedded System?", a: "They usually have a very limited and specific user interface", options: ["They usually have a very limited and specific user interface", "They allow the user to install a wide variety of new software", "They require high-performance cooling systems and large RAM", "They are designed to be upgraded frequently by the end user"], hint: "Minimal controls.", why: "Embedded systems often use simple buttons or dials rather than a full OS interface." },
    { q: "Which of these is an example of an Embedded System?", a: "An electronic control unit inside a modern washing machine", options: ["An electronic control unit inside a modern washing machine", "A laptop computer used for high-end video game development", "A cloud-based server used for storing gigabytes of user files", "A tablet device used for browsing social media and the web"], hint: "Household appliances.", why: "A washing machine has a dedicated computer for one specific purpose." },
    { q: "What is 'System Software'?", a: "Programmes designed to manage and maintain the computer", options: ["Programmes designed to manage and maintain the computer", "Programmes used by a person to complete a specific task", "The physical metal casing that protects the internal components", "The binary data stored in the BIOS of the motherboard"], hint: "Background tasks.", why: "System software (like the OS) manages the hardware and other software." },
    { q: "What is 'Application Software'?", a: "Programmes that allow users to complete specific tasks", options: ["Programmes that allow users to complete specific tasks", "Programmes that control the hardware and file management", "The electrical power supply unit that feeds the motherboard", "The collection of drivers used to communicate with printers"], hint: "User-facing tools.", why: "Apps like word processors or browsers are application software." },
    { q: "Which is a common example of System Software?", a: "A device driver used to operate a new piece of hardware", options: ["A device driver used to operate a new piece of hardware", "A spreadsheet programme used for financial calculations", "A professional photo editor used for digital manipulation", "A mobile game used for entertainment during leisure time"], hint: "Hardware manager.", why: "Drivers are system software that allow the OS to talk to hardware." },
    { q: "Which is a common example of Application Software?", a: "A web browser used to access and view online content", options: ["A web browser used to access and view online content", "A disk defragmenter used to reorder files on a drive", "A compiler used to translate source code into binary", "An operating system used to manage the system memory"], hint: "Browsing the net.", why: "Browsers are used by humans to perform the task of web surfing." },
    { q: "Embedded systems are often preferred because...?", a: "They are highly reliable and consume very little power", options: ["They are highly reliable and consume very little power", "They are much faster than a standard desktop CPU system", "They can be easily programmed to perform any general task", "They allow the user to multi-task between different apps"], hint: "Efficiency.", why: "Because they only do one job, they are optimised for reliability." },
    { q: "What is the 'Control Unit' in a processor?", a: "The part of the CPU that directs the flow of data", options: ["The part of the CPU that directs the flow of data", "The part of the CPU that performs all the mathematical logic", "The physical cable that connects the PC to the internet", "The secondary storage device where the OS is installed"], hint: "Directing traffic.", why: "The CU coordinates the fetch-decode-execute cycle." },
    { q: "Which of these is strictly a Hardware component?", a: "The motherboard that connects all internal components", options: ["The motherboard that connects all internal components", "The antivirus software that scans for malicious files", "The binary code that represents a high-definition image", "The spreadsheet file used to calculate the annual budget"], hint: "Physical board.", why: "The motherboard is the physical spine of the computer." },
    { q: "What happens when you 'Boot' a computer?", a: "The operating system is loaded into the system RAM", options: ["The operating system is loaded into the system RAM", "The hardware components are physically rearranged by code", "The user's files are permanently deleted from the disk", "The processor clock speed is doubled to increase speed"], hint: "Starting up.", why: "Booting (bootstrapping) loads the OS so the computer can function." },
    { q: "Why are some embedded systems 'Real-time'?", a: "They must respond to an input within a strict time limit", options: ["They must respond to an input within a strict time limit", "They only function during the daylight hours of the day", "They update their software every single hour of the day", "They are connected to an atomic clock for perfect timing"], hint: "Instant response.", why: "Real-time systems (like car brakes) must process data immediately." },
    { q: "Which is a characteristic of Application Software?", a: "It is designed to be interacted with directly by the user", options: ["It is designed to be interacted with directly by the user", "It manages the background tasks of the operating system", "It provides the interface for hardware device drivers", "It is built into the ROM of the computer's motherboard"], hint: "User interface.", why: "Applications are tools for the end user, unlike system utilities." },
    { q: "What is the relationship between hardware and software?", a: "Software is the instructions that hardware carries out", options: ["Software is the instructions that hardware carries out", "Hardware is a type of software", "They are two words for the same thing", "Software is stored inside the processor permanently"], hint: "Physical versus instructions.", why: "Neither is useful alone: hardware without software does nothing." },
    { q: "Which is an example of system software?", a: "The operating system", options: ["The operating system", "A word processor", "A web browser", "A photo editor"], hint: "It runs the machine.", why: "System software manages the computer so applications can run." },
    { q: "What is an embedded system?", a: "A computer built into a device to do one specific job", options: ["A computer built into a device to do one specific job", "A computer with several operating systems", "A very large mainframe computer", "A computer with no processor"], hint: "Dedicated purpose.", why: "Washing machines and traffic lights contain embedded systems." },
    { q: "Why are embedded systems often cheaper than general computers?", a: "They need less powerful hardware for one fixed task", options: ["They need less powerful hardware for one fixed task", "They contain no software at all", "They use no electricity", "They are always second hand"], hint: "Only one job to do.", why: "Hardware is specified for that single task, keeping cost and power low." },
    { q: "Which is an example of application software?", a: "A spreadsheet program", options: ["A spreadsheet program", "A device driver", "A utility that defragments a disk", "The operating system"], hint: "A user does a task with it.", why: "Applications let the user achieve something; system software supports them." },
    { q: "What does a device driver do?", a: "Lets the operating system communicate with a piece of hardware", options: ["Lets the operating system communicate with a piece of hardware", "Speeds up the processor", "Stores user documents", "Protects against viruses"], hint: "Translator for hardware.", why: "Each printer or graphics card needs a driver that knows how to talk to it." },
    { q: "Which of these is hardware?", a: "A graphics card", options: ["A graphics card", "An operating system", "A compiler", "A spreadsheet file"], hint: "You can touch it.", why: "Hardware is the physical components of the system." },
    { q: "What happens when a computer boots?", a: "Start-up instructions load the operating system into memory", options: ["Start-up instructions load the operating system into memory", "All files on the hard disk are deleted", "The processor is replaced", "Applications run before the operating system"], hint: "Getting started.", why: "Instructions in ROM begin the process of loading the OS from storage." },
    { q: "Why is an embedded system often described as 'real-time'?", a: "It must respond to events within a strict time limit", options: ["It must respond to events within a strict time limit", "It shows the current time on a display", "It can be updated at any time", "It runs only when a user is present"], hint: "Response deadlines.", why: "Anti-lock brakes must react in milliseconds or the system fails." },
    { q: "Which task belongs to the operating system?", a: "Managing memory between running programs", options: ["Managing memory between running programs", "Editing a photograph", "Writing a school essay", "Designing a web page"], hint: "Managing resources.", why: "Memory, processor time, files and devices are all OS responsibilities." },
    { q: "What is utility software?", a: "Software that maintains and optimises the computer", options: ["Software that maintains and optimises the computer", "Software the user writes themselves", "Software that runs on a phone only", "Software built into the processor"], hint: "Housekeeping tools.", why: "Backup, compression and antivirus tools are all utilities." },
    { q: "Why can an embedded system rarely be upgraded by the user?", a: "Its software is fixed for the single task it performs", options: ["Its software is fixed for the single task it performs", "It has no memory at all", "Users are not allowed to own them", "It runs a full desktop operating system"], hint: "Built in, not installed.", why: "The program is stored in the device rather than installed by the owner." },
    { q: "What is firmware?", a: "Software stored permanently on a hardware device", options: ["Software stored permanently on a hardware device", "A physical component of the processor", "A type of application software", "A network cable standard"], hint: "Between hard and soft.", why: "It is held in ROM or flash and controls the device at a low level." },
    { q: "Which shows the dependency between hardware and software?", a: "A program cannot run without a processor to execute it", options: ["A program cannot run without a processor to execute it", "Hardware writes its own software", "Software can replace faulty hardware", "Hardware runs only on paper"], hint: "One needs the other.", why: "Instructions must be executed by physical circuitry." },
    { q: "Why do modern cars contain many embedded systems?", a: "Separate systems each control one function reliably", options: ["Separate systems each control one function reliably", "One computer cannot fit inside a car", "Embedded systems are decorative", "Cars must run desktop software"], hint: "One job each.", why: "Engine management, braking and climate control are separate dedicated systems." }
  ],
  "3.4.2 Boolean logic": [
    { q: "Which logic gate outputs 1 only if both inputs are 1?", a: "AND gate (logical conjunction)", options: ["AND gate (logical conjunction)", "OR gate (logical disjunction)", "NOT gate (logical negation)", "XOR gate (exclusive or)"], hint: "Both must be True.", why: "AND is the logical equivalent of 'both' (A and B)." },
    { q: "Which gate outputs 1 if at least one input is 1?", a: "OR gate (logical disjunction)", options: ["OR gate (logical disjunction)", "AND gate (logical conjunction)", "NOT gate (logical negation)", "NAND gate (negated and)"], hint: "Either/Or.", why: "OR returns 1 if either A, B, or both are 1." },
    { q: "What is the function of a NOT gate?", a: "To invert the input value from a 1 to 0 or vice versa", options: ["To invert the input value from a 1 to 0 or vice versa", "To combine two binary inputs into a single output bit", "To add two numerical values together in the processor", "To store a single bit of data for a long period of time"], hint: "Inversion.", why: "NOT is a unary operator that flips the bit." },
    { q: "Which gate is shown as a triangle with a circle?", a: "NOT gate (the logical inverter symbol)", options: ["NOT gate (the logical inverter symbol)", "AND gate (the flat-backed D-shaped symbol)", "OR gate (the curved shield-shaped symbol)", "XOR gate (the double-backed curved symbol)"], hint: "One input.", why: "The triangle with a circle (the 'bubble') indicates inversion." },
    { q: "What is the result of (1 AND 0) in Boolean logic?", a: "0 (because both inputs are not set to one)", options: ["0 (because both inputs are not set to one)", "1 (because one of the inputs is set to zero)", "Error (because binary inputs must be identical)", "Null (because no logical result can be found)"], hint: "Both must be 1.", why: "AND requires all inputs to be true to output true." },
    { q: "What is the result of (0 OR 1) in Boolean logic?", a: "1 (because at least one input is set to one)", options: ["1 (because at least one input is set to one)", "0 (because both inputs are not set to one)", "Error (because binary inputs must be identical)", "Null (because no logical result can be found)"], hint: "Is any input 1?", why: "OR only needs one true input to result in true." },
    { q: "A 'Truth Table' for an AND gate has how many rows?", a: "4 (representing all combinations of two binary inputs)", options: ["4 (representing all combinations of two binary inputs)", "2 (representing only the zero and one input states)", "8 (representing all combinations of three binary inputs)", "1 (representing only the final logical result found)"], hint: "2 to the power of inputs.", why: "For 2 inputs (A, B), there are 2^2 = 4 combinations." },
    { q: "What is the output of an OR gate with inputs 0 and 0?", a: "0 (as no inputs are currently set to one)", options: ["0 (as no inputs are currently set to one)", "1 (as a standard default logical output)", "Error (as inputs cannot be identical in this gate)", "Null (as the logical circuit has failed to fire)"], hint: "Is either input 1?", why: "OR requires at least one 1; if both are 0, it outputs 0." },
    { q: "Which gate is shaped like a 'D' with a flat back?", a: "AND gate (the symbol for logical conjunction)", options: ["AND gate (the symbol for logical conjunction)", "OR gate (the symbol for logical disjunction)", "NOT gate (the symbol for logical negation)", "XOR gate (the symbol for exclusive or)"], hint: "D for AND.", why: "The AND gate has a flat back and a rounded front." },
    { q: "Which gate is shaped like a shield with a curved back?", a: "OR gate (the symbol for logical disjunction)", options: ["OR gate (the symbol for logical disjunction)", "AND gate (the symbol for logical conjunction)", "NOT gate (the symbol for logical negation)", "XOR gate (the symbol for exclusive or)"], hint: "Curved shield.", why: "The OR gate symbol features a curved input side." },
    { q: "What is the output of NOT(1)?", a: "0 (the logical inverse of the input)", options: ["0 (the logical inverse of the input)", "1 (the identical copy of the input)", "Error (as NOT requires two binary inputs)", "Null (as the logical inverter has failed)"], hint: "Flip it.", why: "NOT 1 is 0." },
    { q: "What is the output of NOT(0)?", a: "1 (the logical inverse of the input)", options: ["1 (the logical inverse of the input)", "0 (the identical copy of the input)", "Error (as NOT requires two binary inputs)", "Null (as the logical inverter has failed)"], hint: "Flip it.", why: "NOT 0 is 1." },
    { q: "In a circuit with AND and OR, which is processed first?", a: "The AND gate (it has a higher logical precedence)", options: ["The AND gate (it has a higher logical precedence)", "The OR gate (it has a higher logical precedence)", "The gate positioned furthest to the left in code", "The gate positioned furthest to the right in code"], hint: "Like BIDMAS.", why: "In Boolean algebra, AND takes priority over OR." },
    { q: "A 'NAND' gate is a combination of which two gates?", a: "An AND gate followed immediately by a NOT gate", options: ["An AND gate followed immediately by a NOT gate", "An OR gate followed immediately by a NOT gate", "Two AND gates connected in a parallel sequence", "Two NOT gates connected in a serial sequence"], hint: "Not AND.", why: "NAND is literally 'Not AND'." },
    { q: "How many 1s are in the output of an AND truth table?", a: "1 (only the row where both A and B are one)", options: ["1 (only the row where both A and B are one)", "3 (every row except where both A and B are zero)", "2 (the rows where at least one input is set to one)", "0 (if the logical conjunction fails to resolve)"], hint: "Strict requirement.", why: "Only 1-1 results in 1 for an AND gate." },
    { q: "What is the output of an AND gate when both inputs are 1?", a: "1", options: ["1", "0", "Either", "Undefined"], hint: "Both must be on.", why: "AND outputs 1 only when every input is 1." },
    { q: "What is the output of an OR gate when both inputs are 0?", a: "0", options: ["0", "1", "Either", "Undefined"], hint: "Nothing is on.", why: "OR needs at least one input to be 1." },
    { q: "What does a NOT gate do?", a: "Inverts its single input", options: ["Inverts its single input", "Combines two inputs", "Outputs 1 always", "Stores a value"], hint: "One input, flipped.", why: "A NOT gate is the only common gate with a single input." },
    { q: "How many rows are in the truth table for a 2-input gate?", a: "4", options: ["4", "2", "6", "8"], hint: "Two squared.", why: "The combinations are 00, 01, 10 and 11." },
    { q: "What is the output of Q = A OR B when A=0 and B=1?", a: "1", options: ["1", "0", "Either", "Undefined"], hint: "One input is on.", why: "OR outputs 1 whenever any input is 1." },
    { q: "What is the output of Q = NOT A when A=1?", a: "0", options: ["0", "1", "A", "Undefined"], hint: "Invert it.", why: "NOT reverses the input value." },
    { q: "In Boolean algebra, how is NOT A usually written?", a: "With a bar over the A", options: ["With a bar over the A", "With a dot before the A", "With a plus before the A", "With brackets round the A"], hint: "Overline.", why: "The overbar is the standard notation for negation." },
    { q: "What is Q = A.B when A=1 and B=0?", a: "0", options: ["0", "1", "A", "B"], hint: "The dot means AND.", why: "AND requires both inputs to be 1." },
    { q: "What is Q = A+B when A=0 and B=0?", a: "0", options: ["0", "1", "A", "B"], hint: "The plus means OR.", why: "With no input set, OR outputs 0." },
    { q: "Which gate outputs 1 only when its inputs differ?", a: "XOR", options: ["XOR", "AND", "OR", "NOT"], hint: "Exclusive or.", why: "XOR gives 1 for 01 and 10 but 0 for 00 and 11." },
    { q: "What is Q = A.(B+C) when A=1, B=0, C=1?", a: "1", options: ["1", "0", "Either", "Undefined"], hint: "Brackets first.", why: "B+C is 1, and 1 AND 1 gives 1." },
    { q: "Why are logic gates important in a processor?", a: "They perform the binary operations that make up all computation", options: ["They perform the binary operations that make up all computation", "They store the user's files", "They connect the computer to a network", "They convert electricity to light"], hint: "Built from switches.", why: "Arithmetic and decisions are ultimately combinations of gates." },
    { q: "How many rows would a truth table for 4 inputs need?", a: "16", options: ["16", "8", "4", "32"], hint: "Two to the power four.", why: "Each extra input doubles the number of combinations." },
    { q: "What is the output of NOT (A OR B) when A=0 and B=0?", a: "1", options: ["1", "0", "Either", "Undefined"], hint: "Inside first.", why: "A OR B is 0, and NOT 0 is 1." },
    { q: "Which logic expression means 'both switches must be closed'?", a: "A AND B", options: ["A AND B", "A OR B", "NOT A", "A XOR B"], hint: "Both required.", why: "AND models two conditions that must hold at the same time." }
  ],
  "3.4.3 Software classification": [
    { q: "What is the primary role of an Operating System (OS)?", a: "To manage the hardware and provide a user interface", options: ["To manage the hardware and provide a user interface", "To provide a professional tool for editing photographs", "To store high-definition video files on the hard drive", "To protect the system from physical damage or theft"], hint: "The boss of the PC.", why: "The OS handles memory, hardware, and the interface we see." },
    { q: "Which of these is a function of the Operating System?", a: "Managing the system memory and processor scheduling", options: ["Managing the system memory and processor scheduling", "Writing a professional letter to a business contact", "Creating a high-scoring spreadsheet for accounts", "Editing a long video for a social media platform"], hint: "Background management.", why: "Memory management and multitasking are core OS tasks." },
    { q: "What is 'Utility Software'?", a: "Programmes that perform specific maintenance tasks", options: ["Programmes that perform specific maintenance tasks", "Programmes used to create digital art and animations", "The hardware components that provide electrical power", "The high-level code used to build complex websites"], hint: "Maintenance tools.", why: "Utilities (like antivirus) help maintain the computer." },
    { q: "Which of these is an example of a Utility programme?", a: "Disk Defragmenter (reorganising files for speed)", options: ["Disk Defragmenter (reorganising files for speed)", "Microsoft Word (creating text documents for school)", "Google Chrome (browsing the world wide web)", "Windows 10 (the main operating system of the PC)"], hint: "Disk maintenance.", why: "A defragmenter is a utility that optimises the hard drive." },
    { q: "What is the difference between OS and Utilities?", a: "OS is essential for use; Utilities are for maintenance", options: ["OS is essential for use; Utilities are for maintenance", "Utilities are essential; the OS is purely optional", "The OS is hardware; Utilities are strictly software", "The OS is for gaming; Utilities are for office work"], hint: "Need vs Maintenance.", why: "You can't use a PC without an OS, but you can without a defragmenter." },
    { q: "Which utility is used to reduce the size of a file?", a: "Compression software (making files easier to send)", options: ["Compression software (making files easier to send)", "Antivirus software (scanning for malicious code)", "Encryption software (making files secure and secret)", "Backup software (creating copies of important data)"], hint: "Zip files.", why: "Compression utilities shrink data to save space." },
    { q: "Which utility is used to secure data with a key?", a: "Encryption software (making data unreadable)", options: ["Encryption software (making data unreadable)", "Compression software (making data smaller in size)", "Antivirus software (identifying malicious code)", "Defragmentation software (reordering disk files)"], hint: "Keeping secrets.", why: "Encryption utilities scramble data so only those with a key can read it." },
    { q: "Why is 'Defragmentation' needed on a Hard Disk?", a: "To group file parts together for faster access", options: ["To group file parts together for faster access", "To delete all files that are no longer being used", "To scan the system for viruses and malicious code", "To prevent the computer from overheating during use"], hint: "Organising the drive.", why: "Defragmenting moves file fragments to adjacent blocks on the platter." },
    { q: "What is an 'Operating System Kernel'?", a: "The core part of the OS that manages hardware", options: ["The core part of the OS that manages hardware", "The visual interface that the user interacts with", "The hardware casing that protects the motherboard", "The battery unit that provides power to the laptop"], hint: "The heart.", why: "The kernel is the lowest level of the OS, managing the CPU and RAM." },
    { q: "What is 'Multitasking' in an Operating System?", a: "The ability to run multiple programmes at once", options: ["The ability to run multiple programmes at once", "The ability to connect several monitors to one PC", "The ability to store files on multiple hard drives", "The ability for two users to use one mouse at once"], hint: "Many apps.", why: "The OS cycles the CPU between tasks so they seem to run simultaneously." },
    { q: "What is 'GUI'?", a: "Graphical User Interface (using icons and windows)", options: ["Graphical User Interface (using icons and windows)", "General Utility Interface (using maintenance tools)", "Global Unit Identity (using unique serial numbers)", "Grand User Interaction (using advanced logic gates)"], hint: "Windows and Icons.", why: "A GUI uses visual elements rather than just text commands." },
    { q: "What is a 'CLI'?", a: "Command Line Interface (using text commands only)", options: ["Command Line Interface (using text commands only)", "Central Logic Identity (using binary state codes)", "Complex Loop Iteration (using repeating code)", "Clear Local Interaction (using simple hardware)"], hint: "Typing text.", why: "A CLI requires the user to type specific text instructions." },
    { q: "Why do experts often prefer a CLI over a GUI?", a: "It is faster and more powerful for advanced tasks", options: ["It is faster and more powerful for advanced tasks", "It is much easier for a beginner to understand", "It uses more colours and icons on the screen", "It automatically fixes all syntax errors in code"], hint: "Power and speed.", why: "Command lines allow for complex scripting and automation." },
    { q: "Which utility makes an identical copy of data?", a: "Backup software (protecting against data loss)", options: ["Backup software (protecting against data loss)", "Encryption software (protecting against theft)", "Compression software (protecting against size)", "Antivirus software (protecting against infection)"], hint: "Extra copies.", why: "Backup utilities create copies in case of hardware failure." },
    { q: "What is 'WIMP' in the context of a GUI?", a: "Windows, Icons, Menus, and Pointers", options: ["Windows, Icons, Menus, and Pointers", "Words, Images, Music, and Programmes", "Websites, Internet, Media, and Protocols", "Wires, Inputs, Motherboards, and Processors"], hint: "Standard desktop elements.", why: "WIMP describes the four main elements of a modern GUI." },
    { q: "What is the difference between a compiler and an interpreter?", a: "A compiler translates the whole program at once; an interpreter goes line by line", options: ["A compiler translates the whole program at once; an interpreter goes line by line", "An interpreter translates all at once; a compiler goes line by line", "Both translate exactly the same way", "Neither produces machine code"], hint: "All at once or as you go.", why: "A compiler produces a standalone executable; an interpreter needs to be present each run." },
    { q: "What is a high-level language?", a: "One written in a form close to human language", options: ["One written in a form close to human language", "One that runs directly on the processor", "One used only for embedded systems", "One with no keywords"], hint: "Easier for people.", why: "Python and Java abstract away the details of the hardware." },
    { q: "What is machine code?", a: "Binary instructions the processor executes directly", options: ["Binary instructions the processor executes directly", "A language using English keywords", "A file containing program comments", "A diagram of the program structure"], hint: "Pure binary.", why: "It is the only form the CPU can actually run." },
    { q: "What is assembly language?", a: "A low-level language using short mnemonics for instructions", options: ["A low-level language using short mnemonics for instructions", "A high-level language like Python", "A way of drawing flowcharts", "A type of operating system"], hint: "Mnemonics like ADD and MOV.", why: "Each mnemonic usually maps to one machine code instruction." },
    { q: "What is an advantage of a high-level language?", a: "It is quicker to write and easier to debug", options: ["It is quicker to write and easier to debug", "It always produces the fastest programs", "It runs without any translation", "It works only on one processor type"], hint: "Developer productivity.", why: "Readable code is easier to maintain and share between machines." },
    { q: "What is an advantage of a low-level language?", a: "It gives fine control over the hardware", options: ["It gives fine control over the hardware", "It is easier for beginners to read", "It runs on any processor unchanged", "It needs no translation at all"], hint: "Close to the metal.", why: "Device drivers sometimes need this level of control." },
    { q: "What is source code?", a: "The program as written by the programmer", options: ["The program as written by the programmer", "The binary the processor runs", "The output the program produces", "The manual supplied with the program"], hint: "What you type.", why: "Source code must be translated before it can run." },
    { q: "Why does an interpreter make debugging easier?", a: "It reports each error as it reaches that line", options: ["It reports each error as it reaches that line", "It fixes errors automatically", "It never reports any errors", "It compiles the whole program first"], hint: "Stops where it breaks.", why: "You see exactly which line failed as the program runs." },
    { q: "What is one drawback of an interpreted program?", a: "It usually runs more slowly than compiled code", options: ["It usually runs more slowly than compiled code", "It cannot contain loops", "It must be written in binary", "It cannot be edited"], hint: "Translating while running.", why: "Translation happens every time the program runs." },
    { q: "What does a translator do?", a: "Converts program code into a form the computer can run", options: ["Converts program code into a form the computer can run", "Converts text between human languages", "Copies files between computers", "Compresses source code"], hint: "Code to machine code.", why: "Compilers, interpreters and assemblers are all translators." },
    { q: "Why is machine code specific to a processor type?", a: "Different processors understand different instruction sets", options: ["Different processors understand different instruction sets", "Machine code is written in a different alphabet", "Machine code contains the maker's name", "All processors use the same machine code"], hint: "Instruction sets differ.", why: "This is why a compiled program must be rebuilt for a different architecture." },
    { q: "What does an assembler translate?", a: "Assembly language into machine code", options: ["Assembly language into machine code", "Python into assembly language", "Machine code into English", "Flowcharts into pseudo-code"], hint: "One step down.", why: "The mapping is close to one-to-one, so assembly is fast to translate." },
    { q: "Which is translated once and then run many times?", a: "A compiled program", options: ["A compiled program", "An interpreted program", "A flowchart", "A pseudo-code design"], hint: "Build once.", why: "The resulting executable can be distributed without the source." },
    { q: "Why might a developer distribute compiled code rather than source?", a: "It protects the source and runs without a translator installed", options: ["It protects the source and runs without a translator installed", "Compiled code is easier to edit", "Source code cannot be copied", "Compiled code needs no processor"], hint: "Hide the recipe.", why: "Users get a working program without seeing how it was written." },
    { q: "What is a syntax error?", a: "Code that breaks the rules of the language", options: ["Code that breaks the rules of the language", "Code that runs but gives a wrong answer", "Code that runs too slowly", "Code with unhelpful variable names"], hint: "The translator refuses it.", why: "A missing bracket stops translation before the program can run." }
  ],
  "3.4.5 Memory and storage": [
    { q: "What is the main difference between RAM and ROM?", a: "RAM is volatile (lost at power-off); ROM is not", options: ["RAM is volatile (lost at power-off); ROM is not", "ROM is volatile (lost at power-off); RAM is not", "RAM is permanent storage; ROM is temporary", "RAM is much slower than ROM during execution"], hint: "Power loss.", why: "RAM is temporary working memory; ROM is permanent (non-volatile)." },
    { q: "What does 'Volatile' mean in computing?", a: "Data is lost when the power is turned off", options: ["Data is lost when the power is turned off", "Data is encrypted and cannot be read by others", "Data is compressed to save space on the disk", "Data is sent over a network at very high speeds"], hint: "Temporary.", why: "Volatile memory (like RAM) needs electricity to keep its data." },
    { q: "What is usually stored in the ROM?", a: "The BIOS and the computer's start-up instructions", options: ["The BIOS and the computer's start-up instructions", "The user's personal documents and photographs", "The high-definition videos and music files", "The operating system and installed applications"], hint: "Boot instructions.", why: "ROM contains the 'firmware' needed to start the computer." },
    { q: "What is the purpose of 'Virtual Memory'?", a: "Using the hard drive as temporary RAM when full", options: ["Using the hard drive as temporary RAM when full", "Creating a digital copy of the entire computer online", "A type of memory that only stores binary zeros", "A physical hardware component that replaces the CPU"], hint: "Emergency RAM.", why: "When RAM is full, the OS moves inactive data to a part of the disk." },
    { q: "Why is secondary storage needed?", a: "To store data permanently when the power is off", options: ["To store data permanently when the power is off", "To make the central processor run at higher speeds", "To provide a high-speed link to the internet bus", "To prevent the motherboard from overheating"], hint: "Non-volatile.", why: "We need disks/SD cards to save files for the next time we turn on the PC." },
    { q: "What is 'Magnetic' storage?", a: "Storage using spinning platters and magnets", options: ["Storage using spinning platters and magnets", "Storage using flashes of light from a laser beam", "Storage using electronic circuits with no moving parts", "Storage using physical holes punched into paper"], hint: "Hard Disk Drive.", why: "HDDs use magnetic particles on spinning disks to store bits." },
    { removed2027: true, q: "What is 'Optical' storage?", a: "Storage using lasers to read pits and lands", options: ["Storage using lasers to read pits and lands", "Storage using magnetised needles and metal disks", "Storage using high-speed transistors and chips", "Storage using a network connection to a server"], hint: "CDs and DVDs.", why: "Optical drives use light to read reflections from a disk surface." },
    { q: "What is 'Solid State' (SSD) storage?", a: "Storage using electronic flash memory chips", options: ["Storage using electronic flash memory chips", "Storage using spinning glass disks and lasers", "Storage using large magnets and moving metal arms", "Storage using a remote cloud-based file system"], hint: "No moving parts.", why: "SSDs use transistors (flash memory), making them very fast and durable." },
    { q: "Which storage is best for a portable device?", a: "Solid State (due to durability and no moving parts)", options: ["Solid State (due to durability and no moving parts)", "Magnetic (due to the very high storage capacity)", "Optical (due to the low cost of the media disks)", "Cloud (due to the infinite storage available)"], hint: "Tough and small.", why: "SSDs don't break when shaken, unlike spinning hard drives." },
    { q: "Which storage is generally the cheapest per GB?", a: "Magnetic (HDDs provide high capacity for less)", options: ["Magnetic (HDDs provide high capacity for less)", "Solid State (SSDs provide speed for high cost)", "Optical (CDs provide very low storage capacity)", "RAM (providing high speed for the highest cost)"], hint: "Traditional hard drives.", why: "HDDs are currently the most cost-effective for large amounts of data." },
    { q: "How many bytes are in a Kilobyte (KB)?", a: "1000 bytes (standard SI decimal unit)", options: ["1000 bytes (standard SI decimal unit)", "1024 bytes (binary equivalent unit)", "100 bytes (centigrade decimal unit)", "8 bytes (the number of bits in a byte)"], hint: "1000.", why: "In modern exams, KB is 1000; KiB is 1024." },
    { q: "Place these in order: MB, KB, GB, TB.", a: "KB, MB, GB, TB", options: ["KB, MB, GB, TB", "TB, GB, MB, KB", "MB, KB, TB, GB", "GB, TB, KB, MB"], hint: "Smallest to largest.", why: "Kilo, Mega, Giga, Tera is the standard order of magnitude." },
    { removed2027: true, q: "What is the main disadvantage of Optical storage?", a: "Low capacity and they are easily scratched", options: ["Low capacity and they are easily scratched", "They are extremely expensive to manufacture", "They use a lot of power and get very hot", "They are too fast for most computers to use"], hint: "Fragile disks.", why: "CDs/DVDs don't hold much data and break easily." },
    { q: "What is 'Cloud Storage'?", a: "Storing files on remote servers over the internet", options: ["Storing files on remote servers over the internet", "Storing files on a local SSD inside the laptop", "Storing files on a magnetic disk using a laser", "Storing files inside the CPU's cache memory"], hint: "Online storage.", why: "Cloud storage is just someone else's server accessed via the web." },
    { q: "Which has the fastest access speed?", a: "CPU Cache (located directly on the processor)", options: ["CPU Cache (located directly on the processor)", "System RAM (located on the motherboard)", "Solid State Drive (located in the casing)", "Magnetic Hard Drive (connected via a cable)"], hint: "Closest to the brain.", why: "Cache is the fastest, followed by RAM, then SSD, then HDD." },
    { q: "What is the main difference between RAM and cache?", a: "Cache is smaller and faster, sitting closer to the CPU", options: ["Cache is smaller and faster, sitting closer to the CPU", "Cache is larger and slower than RAM", "Cache is non-volatile but RAM is not", "They are two names for the same thing"], hint: "Speed and size.", why: "Cache holds frequently used data so the CPU waits less often." },
    { q: "Which memory keeps its contents when power is removed?", a: "ROM", options: ["ROM", "RAM", "Cache", "Registers"], hint: "Non-volatile.", why: "ROM retains the start-up instructions permanently." },
    { q: "What is a register?", a: "A tiny, extremely fast store inside the CPU", options: ["A tiny, extremely fast store inside the CPU", "A large backup store on disk", "A list of installed programs", "A network address"], hint: "Fastest of all.", why: "Registers hold the values the processor is working on right now." },
    { q: "Why is secondary storage needed as well as RAM?", a: "RAM is volatile, so data would be lost on shutdown", options: ["RAM is volatile, so data would be lost on shutdown", "RAM cannot store numbers", "Secondary storage is faster than RAM", "RAM is only used for printing"], hint: "Keeping data.", why: "Files must survive after the power goes off." },
    { q: "What is virtual memory?", a: "Space on secondary storage used when RAM is full", options: ["Space on secondary storage used when RAM is full", "Extra RAM added by the user", "Memory inside the graphics card", "A backup copy of the operating system"], hint: "Borrowed from disk.", why: "It prevents crashes when RAM runs out, but is much slower." },
    { q: "Why is a solid state drive faster than a magnetic hard disk?", a: "It has no moving parts to wait for", options: ["It has no moving parts to wait for", "It stores less data overall", "It uses magnetic fields more efficiently", "It is physically larger"], hint: "Nothing spins.", why: "There is no need to wait for a platter to rotate under a head." },
    { q: "What is cloud storage?", a: "Storage on remote servers accessed over a network", options: ["Storage on remote servers accessed over a network", "A backup drive kept inside the computer", "Memory built into the processor", "A type of magnetic tape"], hint: "Someone else's computers.", why: "Files are held remotely and reached over the internet." },
    { q: "What is a disadvantage of cloud storage?", a: "You need a network connection to reach your files", options: ["You need a network connection to reach your files", "Files can never be shared", "It offers very little capacity", "It cannot be accessed from a phone"], hint: "Offline problem.", why: "Without connectivity the data is unavailable." },
    { q: "Which storage would suit a rugged portable device?", a: "Solid state", options: ["Solid state", "Magnetic hard disk", "Magnetic tape", "A spinning platter drive"], hint: "No moving parts.", why: "Solid state survives knocks that would damage a spinning disk." },
    { q: "Why is magnetic storage still used in large data centres?", a: "It offers very high capacity at low cost per gigabyte", options: ["It offers very high capacity at low cost per gigabyte", "It is the fastest storage available", "It requires no power", "It never wears out"], hint: "Cheap bulk storage.", why: "Cost per gigabyte matters more than speed for archived data." },
    { q: "What does 'volatile' mean?", a: "Contents are lost when power is removed", options: ["Contents are lost when power is removed", "Contents cannot be changed", "Contents are encrypted", "Contents are stored twice"], hint: "Needs power.", why: "RAM is volatile, which is why work must be saved." },
    { q: "Why does adding more RAM often speed up a computer?", a: "More programs fit in memory, reducing use of virtual memory", options: ["More programs fit in memory, reducing use of virtual memory", "It increases the processor's clock speed", "It makes the hard disk spin faster", "It adds more processor cores"], hint: "Less swapping.", why: "Reading from disk is far slower than reading from RAM." },
    { q: "Which is closest to the CPU in the memory hierarchy?", a: "Registers", options: ["Registers", "Cache", "RAM", "Secondary storage"], hint: "Inside the CPU itself.", why: "The hierarchy runs registers, cache, RAM then secondary storage." },
    { q: "What is stored in ROM on a typical computer?", a: "The instructions needed to start the machine", options: ["The instructions needed to start the machine", "The user's documents", "Currently running programs", "Temporary internet files"], hint: "Boot instructions.", why: "They must be available before any storage device is ready." },
    { q: "Why do SSDs have a limited number of write cycles?", a: "The memory cells wear out after repeated writing", options: ["The memory cells wear out after repeated writing", "The magnetic coating flakes off", "The spinning platter slows down", "The laser loses power"], hint: "Cells degrade.", why: "Controllers spread writes across cells to extend the drive's life." },
    { q: "Which offers the fastest access time?", a: "Cache memory", options: ["Cache memory", "RAM", "A solid state drive", "A magnetic hard disk"], hint: "Nearest the processor.", why: "Cache is built to be checked before the slower RAM." },
    { q: "What happens when RAM is full and more is needed?", a: "Less-used data is moved to virtual memory on disk", options: ["Less-used data is moved to virtual memory on disk", "The computer deletes open files", "The processor stops permanently", "RAM automatically expands"], hint: "Swap it out.", why: "Swapping keeps things running but slows the system noticeably." }
  ],
  "3.5.1 Networks and hardware": [
    { q: "What is the primary definition of a computer 'Network'?", a: "Two or more computers connected together to share resources", options: ["Two or more computers connected together to share resources", "A single powerful computer used for complex mathematical tasks", "A collection of software programmes used to manage system files", "A physical hardware casing used to protect the central processor"], hint: "Connection for sharing.", why: "Networks allow for the exchange of data and sharing of peripherals like printers." },
    { q: "What is a 'Local Area Network' (LAN)?", a: "A network covering a small geographical area like a single building", options: ["A network covering a small geographical area like a single building", "A network connecting multiple cities across a large country", "A global collection of interconnected networks like the Internet", "A wireless connection between a smartphone and a pair of headphones"], hint: "Think of a school or home.", why: "LANs are confined to a small site, often owned by one person or organisation." },
    { q: "What is a 'Wide Area Network' (WAN)?", a: "A network connecting multiple sites over a large geographical area", options: ["A network connecting multiple sites over a large geographical area", "A network that only connects devices within a single small room", "A network that uses only high-speed fibre optic cables for data", "A network designed specifically for household smart appliances"], hint: "Think of the Internet.", why: "WANs connect LANs across cities or countries, often using third-party infrastructure." },
    { removed2027: true, q: "Which topology connects all devices to a central switch?", a: "Star topology (where every cable runs to a middle hub)", options: ["Star topology (where every cable runs to a middle hub)", "Bus topology (where all devices share a single main cable)", "A single cable shared by every device in turn", "Each device wired directly to every other device"], hint: "A central point.", why: "In a star topology, the switch manages all data traffic to the devices." },
    { removed2027: true, q: "What is an advantage of the Star topology?", a: "The failure of one cable does not affect the rest of the network", options: ["The failure of one cable does not affect the rest of the network", "It is the cheapest topology to install due to minimal cabling", "It does not require a central switch or hub to manage the data", "It is impossible for a hacker to gain access to the central hub"], hint: "Reliability.", why: "Because each device has its own line, others stay online if one fails." },
    { q: "Which device is used to connect a LAN to the Internet?", a: "Router (directing data packets between different networks)", options: ["Router (directing data packets between different networks)", "Switch (connecting multiple devices within a single local LAN)", "Hub (broadcasting data to every device connected to the port)", "Server (storing all the files and applications for the users)"], hint: "Gateway device.", why: "Routers forward data packets between different networks (e.g., home to ISP)." },
    { removed2027: true, q: "What is the role of a 'Switch' in a Star network?", a: "To send data only to the specific device it is intended for", options: ["To send data only to the specific device it is intended for", "To broadcast data to every single device on the network", "To connect the local network to a wide area network site", "To provide a physical security barrier against system hackers"], hint: "Intelligent hub.", why: "Switches use MAC addresses to ensure data reaches the correct destination." },
    { removed2027: true, q: "Which topology used a 'backbone' cable with terminators?", a: "Bus topology (where all devices share one communication line)", options: ["Bus topology (where all devices share one communication line)", "Star topology (where devices connect to a central point)", "A central switch every device plugs into", "A wireless link with no cabling at all"], hint: "A single line.", why: "A bus topology uses one central cable; terminators stop signals reflecting." },
    { removed2027: true, q: "What is a disadvantage of a Bus topology?", a: "If the main backbone cable fails, the whole network goes down", options: ["If the main backbone cable fails, the whole network goes down", "It requires a very expensive central switch to function", "It uses the most amount of cabling of any network type", "Data can only travel in one direction around the circle"], hint: "Single point of failure.", why: "The backbone is critical; if it breaks, no devices can communicate." },
    { q: "Why are wireless networks (WLANs) popular?", a: "They allow for easy mobility and are cheaper to install", options: ["They allow for easy mobility and are cheaper to install", "They are much faster and more secure than wired networks", "They are not affected by physical walls or interference", "They do not require a router or a switch to function"], hint: "No wires.", why: "WLANs use radio waves, avoiding the need for expensive physical cabling." },
    { q: "What is 'Bandwidth'?", a: "The maximum amount of data that can be sent in a given time", options: ["The maximum amount of data that can be sent in a given time", "The physical width of the cables used in the local network", "The total number of devices currently connected to the hub", "The speed at which the central processor executes its code"], hint: "Network capacity.", why: "Bandwidth measures how much data the 'pipe' can handle (e.g., Mbps)." },
    { q: "What is a 'Network Interface Controller' (NIC)?", a: "Hardware that allows a computer to connect to a network", options: ["Hardware that allows a computer to connect to a network", "Software that manages the start-up of the operating system", "A type of logic gate used to combine two binary inputs", "A secondary storage device used for permanent data backup"], hint: "Every PC needs one.", why: "The NIC provides the physical and electrical connection to the network." },
    { q: "What is a PAN?", a: "A personal area network covering a few metres", options: ["A personal area network covering a few metres", "A network spanning several countries", "A network of exactly two servers", "A public access network in a library"], hint: "Around one person.", why: "Connecting a phone to wireless earbuds creates a PAN." },
    { q: "Which network type covers a single building or site?", a: "LAN", options: ["LAN", "WAN", "PAN", "MAN"], hint: "Local.", why: "A school or office network is a LAN, owned by the organisation." },
    { q: "What is the main difference between a LAN and a WAN?", a: "A WAN covers a wide geographical area, often using third-party lines", options: ["A WAN covers a wide geographical area, often using third-party lines", "A LAN is always wireless", "A WAN can only connect two computers", "A LAN cannot access the internet"], hint: "Distance and ownership.", why: "An organisation owns its LAN hardware but rents WAN connections." },
    { q: "What does a router do?", a: "Forwards data between different networks", options: ["Forwards data between different networks", "Converts analogue sound to digital", "Stores backup copies of files", "Amplifies a wireless signal only"], hint: "Between networks.", why: "It is what connects a home LAN to the wider internet." },
    { q: "What does a switch do on a network?", a: "Directs data only to the device it is addressed to", options: ["Directs data only to the device it is addressed to", "Broadcasts data to every connected device", "Converts wireless signals to light", "Assigns website names to addresses"], hint: "Targeted delivery.", why: "Sending only to the intended port reduces unnecessary traffic." },
    { q: "What is a NIC?", a: "The hardware that connects a device to a network", options: ["The hardware that connects a device to a network", "A program that scans for viruses", "A type of network cable", "A server that stores web pages"], hint: "Interface card.", why: "Every networked device needs one, wired or wireless." },
    { q: "What is bandwidth?", a: "The amount of data that can be carried per second", options: ["The amount of data that can be carried per second", "The physical width of a cable", "The number of devices on a network", "The distance a signal can travel"], hint: "Capacity per second.", why: "Higher bandwidth means more data moves in the same time." },
    { q: "What is an advantage of a wired connection over wireless?", a: "It is generally faster and less prone to interference", options: ["It is generally faster and less prone to interference", "It allows devices to move freely", "It needs no hardware at all", "It works over any distance"], hint: "Stable and quick.", why: "Cables avoid the interference and contention wireless suffers from." },
    { q: "What is an advantage of a wireless connection?", a: "Devices can move around freely", options: ["Devices can move around freely", "It always has higher bandwidth", "It is never affected by walls", "It needs no network hardware"], hint: "Mobility.", why: "No cabling means devices are not tied to one location." },
    { q: "What is a client-server network?", a: "Clients request services from a central server", options: ["Clients request services from a central server", "Every computer has equal status", "Only one computer may be switched on", "Data is stored on paper records"], hint: "Central provider.", why: "Schools use this so files and logins are managed centrally." },
    { q: "What is a peer-to-peer network?", a: "All computers have equal status and share resources directly", options: ["All computers have equal status and share resources directly", "One central computer controls all others", "Data must pass through a printer", "Only wireless devices may join"], hint: "No boss.", why: "It is cheap and simple but harder to back up and secure." },
    { q: "What is a MAC address?", a: "A unique identifier assigned to a network interface", options: ["A unique identifier assigned to a network interface", "A temporary address given by a router", "The name of a website", "A password used to join a network"], hint: "Fixed to the hardware.", why: "Unlike an IP address it does not change as the device moves networks." },
    { q: "What is a WAP?", a: "A device that lets wireless devices join a wired network", options: ["A device that lets wireless devices join a wired network", "A program that blocks websites", "A cable used for long distances", "A type of network protocol"], hint: "Wireless access point.", why: "It bridges radio signals and the wired network." },
    { q: "What is the internet?", a: "A global network of interconnected networks", options: ["A global network of interconnected networks", "A single very large computer", "A collection of web pages only", "A type of cable used worldwide"], hint: "Network of networks.", why: "The web is one service that runs on top of the internet." },
    { q: "What is a server?", a: "A computer that provides services to other computers", options: ["A computer that provides services to other computers", "A computer used only for gaming", "A device that prints documents", "A cable joining two buildings"], hint: "It serves requests.", why: "File, web and mail servers each provide a particular service." },
    { q: "Why might a school choose a client-server network?", a: "Files and user accounts can be managed centrally", options: ["Files and user accounts can be managed centrally", "It needs no network hardware", "Each pupil manages their own backups", "It works without any cabling"], hint: "Central control.", why: "Central management makes backup, security and updates far easier." },
    { q: "What is a DNS server used for?", a: "Translating domain names into IP addresses", options: ["Translating domain names into IP addresses", "Storing a website's images", "Blocking unwanted emails", "Encrypting network traffic"], hint: "Name to number.", why: "Humans remember names while computers route using numeric addresses." },
    { q: "What limits how much data a network can carry at once?", a: "The available bandwidth", options: ["The available bandwidth", "The number of printers attached", "The colour of the cabling", "The age of the operating system"], hint: "Capacity.", why: "When demand exceeds bandwidth, performance drops for everyone." },
    { q: "Why does adding many users slow a network?", a: "They share the same finite bandwidth", options: ["They share the same finite bandwidth", "Each user removes a cable", "Servers shut down automatically", "Routers stop forwarding data"], hint: "Sharing the pipe.", why: "Contention for limited capacity increases waiting time." },
    { q: "What is the role of a network cable's shielding?", a: "To reduce interference from outside signals", options: ["To reduce interference from outside signals", "To increase the cable's length", "To carry electrical power", "To store data temporarily"], hint: "Keep noise out.", why: "Shielding protects the signal so fewer errors occur." },
    { q: "Which would you use to connect two buildings a kilometre apart?", a: "Fibre-optic cable", options: ["Fibre-optic cable", "A standard wireless access point", "A USB cable", "A printer cable"], hint: "Light over distance.", why: "Fibre carries data much further without significant signal loss." },
    { q: "What is a disadvantage of a peer-to-peer network?", a: "Backups and security are harder to manage", options: ["Backups and security are harder to manage", "It requires an expensive server", "It cannot share files at all", "It only works with three computers"], hint: "No central control.", why: "Each machine must be maintained individually." },
    { q: "Why is fibre-optic cable faster than copper over long distances?", a: "It carries data as light with very little signal loss", options: ["It carries data as light with very little signal loss", "It is thicker than copper cable", "It uses more electricity", "It carries data as sound"], hint: "Light, not electricity.", why: "Light suffers far less attenuation than an electrical signal." }
  ],
  "3.5.2 Protocols and layers": [
    { q: "What is a 'Network Protocol'?", a: "A set of rules for how data is transmitted across a network", options: ["A set of rules for how data is transmitted across a network", "A type of hardware used to connect a PC to the internet", "A software programme used to encrypt user text documents", "A specific type of high-speed fibre optic network cable"], hint: "The rules of communication.", why: "Protocols ensure that different devices can understand each other." },
    { q: "Which protocol is used for sending and receiving emails?", a: "SMTP (used for sending) and IMAP (used for receiving)", options: ["SMTP (used for sending) and IMAP (used for receiving)", "HTTP (used for viewing) and FTP (used for downloading)", "TCP (used for packets) and IP (used for addressing)", "MAC (used for hardware) and NIC (used for connecting)"], hint: "Mail protocols.", why: "SMTP pushes mail to servers; IMAP allows you to manage it on the server." },
    { q: "What does 'HTTP' stand for?", a: "Hypertext Transfer Protocol (used for accessing web pages)", options: ["Hypertext Transfer Protocol (used for accessing web pages)", "High Tone Transfer Process (used for audio recordings)", "Hard Text Transition Protocol (used for file encryption)", "Hyper Text Total Processor (used for system software)"], hint: "Web browser protocol.", why: "HTTP is the foundation of data exchange on the World Wide Web." },
    { q: "What is the difference between HTTP and HTTPS?", a: "HTTPS is encrypted and secure; HTTP is not encrypted", options: ["HTTPS is encrypted and secure; HTTP is not encrypted", "HTTP is faster for downloading large video and image files", "HTTPS is only used for internal local area network sites", "HTTP requires a password to access any of its content"], hint: "S stands for Secure.", why: "HTTPS uses SSL/TLS to encrypt data sent between the browser and server." },
    { q: "What is the purpose of 'TCP' (Transmission Control Protocol)?", a: "To break data into packets and ensure they are delivered", options: ["To break data into packets and ensure they are delivered", "To assign a unique geographical address to every computer", "To translate web domain names into numerical IP addresses", "To manage the physical connection between the NIC and cable"], hint: "Packet management.", why: "TCP handles error checking and reassembling packets in the correct order." },
    { q: "What is the purpose of the 'IP' (Internet Protocol)?", a: "To route data packets to the correct destination address", options: ["To route data packets to the correct destination address", "To establish a secure encrypted link between two devices", "To provide a set of rules for transferring large files", "To manage the hardware signals sent over a wireless link"], hint: "Addressing.", why: "IP is responsible for addressing and routing packets across the internet." },
    { q: "What is a 'Layer' in the context of network protocols?", a: "A group of related protocols that perform a specific task", options: ["A group of related protocols that perform a specific task", "A physical sheet of plastic used to protect network cables", "A type of security software that blocks unauthorised access", "A specific frequency used for high-speed wireless data"], hint: "TCP/IP Stack.", why: "Layering breaks down communication into manageable, independent parts." },
    { q: "What is an advantage of using Layers?", a: "Changes can be made to one layer without affecting others", options: ["Changes can be made to one layer without affecting others", "It makes the network run at significantly higher speeds", "It prevents all types of hardware failure from occurring", "It reduces the total number of bits needed for binary data"], hint: "Modular design.", why: "Layering allows developers to focus on one part of the stack at a time." },
    { removed2027: true, q: "Which protocol is used to retrieve files from a server?", a: "FTP (File Transfer Protocol)", options: ["FTP (File Transfer Protocol)", "HTTP (Hypertext Transfer Protocol)", "SMTP (Simple Mail Transfer Protocol)", "POP (Post Office Protocol)"], hint: "File transfer.", why: "FTP is specifically designed for uploading and downloading files." },
    { q: "What is the 'Application Layer' responsible for?", a: "Providing network services to software applications", options: ["Providing network services to software applications", "Breaking data into packets for transmission across wires", "Managing the physical electrical signals sent over cables", "Routing data packets to their final geographical address"], hint: "Top layer (HTTP/FTP).", why: "This is the layer users interact with via browsers or email clients." },
    { q: "What is a 'MAC Address'?", a: "A unique hardware address built into every network card", options: ["A unique hardware address built into every network card", "A temporary numerical address assigned by the internet", "A set of rules used to compress high-definition video", "A type of software used to manage the system memory"], hint: "Physical address.", why: "MAC addresses are permanent and unique to the NIC (Media Access Control)." },
    { q: "What is the difference between MAC and IP addresses?", a: "MAC is permanent hardware; IP is temporary and logical", options: ["MAC is permanent hardware; IP is temporary and logical", "IP is permanent hardware; MAC is temporary and logical", "MAC is for wireless; IP is for wired connections only", "IP is for small files; MAC is for large data transfers"], hint: "Physical vs Logical.", why: "MAC identifies the device; IP identifies its current location on a network." },
    { q: "What is the 'Link Layer' responsible for?", a: "Passing data over the physical network hardware", options: ["Passing data over the physical network hardware", "Identifying the logical address of the destination PC", "Handling the end-to-end communication and error checks", "Allowing the user to interact with the web browser app"], hint: "Bottom layer.", why: "The Link layer deals with NICs and cables (the physical medium)." },
    { q: "Which protocol is used to automatically assign IP addresses?", a: "DHCP (Dynamic Host Configuration Protocol)", options: ["DHCP (Dynamic Host Configuration Protocol)", "DNS (Domain Name System)", "TCP (Transmission Control Protocol)", "IMAP (Internet Message Access Protocol)"], hint: "Automatic IPs.", why: "DHCP saves time by assigning IP addresses to devices as they join." },
    { q: "What is 'DNS' (Domain Name System)?", a: "Translating web domain names into numerical IP addresses", options: ["Translating web domain names into numerical IP addresses", "A type of hardware used to boost wireless signal range", "A security protocol used to encrypt sensitive user data", "A method for compressing text files to save disk space"], hint: "The internet's phonebook.", why: "DNS lets humans use names (google.com) instead of numbers (142.250.x.x)." },
    { q: "What is a protocol?", a: "An agreed set of rules for communication", options: ["An agreed set of rules for communication", "A physical cable standard", "A program that blocks viruses", "A type of network hardware"], hint: "Rules both sides follow.", why: "Without shared rules, two devices cannot interpret each other's data." },
    { q: "At which layer does the IP protocol operate?", a: "The internet layer", options: ["The internet layer", "The transport layer", "The application layer", "The link layer"], hint: "Addressing and routing.", why: "IP addresses and routes packets across networks." },
    { q: "At which layer does TCP operate?", a: "The transport layer", options: ["The transport layer", "The internet layer", "The application layer", "The link layer"], hint: "Sets up the conversation.", why: "TCP agrees settings and ensures reliable delivery between hosts." },
    { q: "Which protocols operate at the application layer?", a: "HTTP, HTTPS, SMTP and IMAP", options: ["HTTP, HTTPS, SMTP and IMAP", "TCP and IP", "IP only", "None of them"], hint: "What the user's software speaks.", why: "These are the protocols web browsers and email clients use directly." },
    { q: "What are the four layers of the TCP/IP model in order?", a: "Application, transport, internet, link", options: ["Application, transport, internet, link", "Link, internet, transport, application", "Application, internet, transport, link", "Transport, application, link, internet"], hint: "Top down.", why: "Data passes down the layers to send and back up to receive." },
    { q: "What sits at the link layer?", a: "The network hardware and its drivers", options: ["The network hardware and its drivers", "Web browsers and email clients", "IP addressing", "Packet reassembly"], hint: "Physical connection.", why: "The NIC and the operating system drivers operate here." },
    { q: "Why is a layered model useful?", a: "Each layer can be changed without affecting the others", options: ["Each layer can be changed without affecting the others", "It makes the network physically smaller", "It removes the need for protocols", "It doubles the available bandwidth"], hint: "Separation of concerns.", why: "Standard interfaces between layers allow independent development." },
    { q: "What does HTTPS add compared with HTTP?", a: "Encryption of the data in transit", options: ["Encryption of the data in transit", "Faster page loading", "Automatic spelling correction", "Support for images"], hint: "The S is for secure.", why: "It protects passwords and card details from eavesdroppers." },
    { q: "Which protocol sends an email to a mail server?", a: "SMTP", options: ["SMTP", "IMAP", "HTTP", "IP"], hint: "Simple Mail Transfer.", why: "SMTP handles sending; IMAP handles retrieving." },
    { q: "Which protocol retrieves and manages email on a server?", a: "IMAP", options: ["IMAP", "SMTP", "HTTPS", "TCP"], hint: "Message Access.", why: "IMAP keeps messages on the server so they sync across devices." },
    { q: "What is a packet?", a: "A small block of data sent across a network", options: ["A small block of data sent across a network", "A complete file sent in one piece", "A physical network cable", "A security certificate"], hint: "Data split up.", why: "Splitting data lets it share the network and be re-sent if lost." },
    { q: "Why is data split into packets?", a: "Lost data can be re-sent without repeating the whole file", options: ["Lost data can be re-sent without repeating the whole file", "Packets travel faster than light", "It removes the need for addressing", "It encrypts the data automatically"], hint: "Resend just the piece.", why: "It also lets many conversations share the same connection." },
    { q: "What does the application layer do?", a: "Provides network services directly to the user's software", options: ["Provides network services directly to the user's software", "Routes packets between networks", "Controls the network cabling", "Splits data into electrical signals"], hint: "Closest to the user.", why: "Browsers and mail clients operate at this layer." },
    { q: "What does the transport layer agree between two hosts?", a: "Settings such as packet size, and reliable delivery", options: ["Settings such as packet size, and reliable delivery", "Which cable to use", "The colour depth of images", "The user's password"], hint: "Sets up the conversation.", why: "TCP negotiates the connection before data flows." },
    { q: "Why do both sender and receiver need the same protocol?", a: "Otherwise the data cannot be interpreted correctly", options: ["Otherwise the data cannot be interpreted correctly", "Otherwise the cable will overheat", "Otherwise the packets travel too slowly", "Otherwise the network shuts down"], hint: "Shared rules.", why: "A protocol defines the format both ends must agree on." },
    { q: "What happens to data as it passes down the layers when sending?", a: "Each layer adds the information the matching layer will need", options: ["Each layer adds the information the matching layer will need", "Each layer deletes part of the data", "The data is compressed at every layer", "The data is printed at each stage"], hint: "Wrapped up.", why: "The receiving device unwraps it layer by layer on the way up." }
  ],
  "3.6.1 Fundamentals of cyber security": [
    { q: "What is the primary definition of 'Cyber Security'?", a: "Processes and controls designed to protect systems and data", options: ["Processes and controls designed to protect systems and data", "A type of hardware used to increase the speed of the internet", "The physical casing used to protect the central processor unit", "A programme used to organise and delete old user documents"], hint: "Protection of digital assets.", why: "Cyber security encompasses all measures taken to protect against digital attacks." },
    { q: "What does the 'C' stand for in the CIA triad?", a: "Confidentiality (ensuring only authorised users see data)", options: ["Confidentiality (ensuring only authorised users see data)", "Calculation (ensuring the processor performs math correctly)", "Connection (ensuring the network stays online and active)", "Compression (ensuring the file size is as small as possible)"], hint: "Secret data.", why: "Confidentiality ensures that sensitive information is not disclosed to unauthorised individuals." },
    { q: "What does the 'I' stand for in the CIA triad?", a: "Integrity (ensuring data is accurate and not tampered with)", options: ["Integrity (ensuring data is accurate and not tampered with)", "Iteration (ensuring the code repeats for a specific count)", "Input (ensuring the user provides the correct data type)", "Interface (ensuring the graphics look attractive to the user)"], hint: "Accuracy of data.", why: "Integrity guarantees that information is reliable and has not been maliciously changed." },
    { q: "What does the 'A' stand for in the CIA triad?", a: "Availability (ensuring systems are accessible when needed)", options: ["Availability (ensuring systems are accessible when needed)", "Authentication (ensuring the user has the correct password)", "Assignment (ensuring the variable has a valid data value)", "Abstraction (ensuring unnecessary details are removed)"], hint: "Access to systems.", why: "Availability ensures that systems and data are ready for use by authorised parties." },
    { q: "Why is 'Cyber Security' essential for modern businesses?", a: "To prevent financial loss and protect the company reputation", options: ["To prevent financial loss and protect the company reputation", "To make the central processor run at much higher speeds", "To allow the user to install any type of software for free", "To reduce the amount of electrical power used by the server"], hint: "Business protection.", why: "Cyber attacks can lead to massive fines, lawsuits, and loss of customer trust." },
    { q: "What is 'White-box' penetration testing?", a: "Testing where the hacker has full knowledge of the system", options: ["Testing where the hacker has full knowledge of the system", "Testing where the hacker has no prior knowledge of the system", "Testing that only focuses on the physical security of the site", "Testing that is performed only by the original programmer"], hint: "Internal view.", why: "White-box testing simulates an attack by an insider or someone with documentation." },
    { q: "What is 'Black-box' penetration testing?", a: "Testing where the hacker has no prior knowledge of the system", options: ["Testing where the hacker has no prior knowledge of the system", "Testing where the hacker has full access to the source code", "Testing that is only performed during the night-time hours", "Testing that only scans the hardware for physical defects"], hint: "External view.", why: "Black-box testing simulates an external attack where the hacker knows nothing initially." },
    { q: "What is the goal of 'Penetration Testing'?", a: "To identify and fix security vulnerabilities in a system", options: ["To identify and fix security vulnerabilities in a system", "To increase the total storage capacity of the hard drive", "To allow the user to bypass the standard login screen", "To make the operating system look more modern and sleek"], hint: "Ethical hacking.", why: "Pen-testing finds weaknesses before real hackers can exploit them." },
    { q: "A 'Shoulder Surfing' attack involves...?", a: "Physically watching someone enter their secret credentials", options: ["Physically watching someone enter their secret credentials", "Sending a malicious email to thousands of random users", "Remotely accessing a computer through a network port", "Guessing a common password like '12345' or 'password'"], hint: "Looking over someone's shoulder.", why: "This is a physical form of social engineering used to steal PINs or passwords." },
    { q: "What is the purpose of 'Cyber Security' laws?", a: "To provide a legal framework for prosecuting digital crime", options: ["To provide a legal framework for prosecuting digital crime", "To force every citizen to use a specific type of hardware", "To make the internet free for everyone around the world", "To prevent companies from making any profit from software"], hint: "Legal protection.", why: "Laws like the Computer Misuse Act make unauthorised access a criminal offence." },
    { q: "What is 'Social Engineering'?", a: "Manipulating people into giving up sensitive information", options: ["Manipulating people into giving up sensitive information", "Building a hardware connection between two server sites", "Writing a complex algorithm to sort a large dataset", "Using a mathematical formula to encrypt a text document"], hint: "Human hacking.", why: "Social engineering targets human psychology rather than technical flaws." },
    { q: "Which of these is a 'Physical' security measure?", a: "Using biometric locks or CCTV cameras on the premises", options: ["Using biometric locks or CCTV cameras on the premises", "Installing a software firewall to block network traffic", "Encrypting all user files stored on the primary hard drive", "Requiring a complex password for the administrator login"], hint: "Real-world locks.", why: "Physical security prevents unauthorised people from reaching the hardware." },
    { q: "Why is 'Staff Training' important for cyber security?", a: "To help employees recognise and avoid phishing attempts", options: ["To help employees recognise and avoid phishing attempts", "To teach employees how to fix broken hardware components", "To allow employees to write their own operating systems", "To ensure employees can type at a very high speed per minute"], hint: "Awareness.", why: "Humans are often the weakest link; training helps them spot scams." },
    { q: "What is a 'Vulnerability' in a system?", a: "A weakness that could be exploited by a cyber threat", options: ["A weakness that could be exploited by a cyber threat", "A type of high-speed cable used for network connections", "A software programme used to back up important user data", "A hardware component that increases the system memory"], hint: "A gap in the wall.", why: "Vulnerabilities can be unpatched software, weak passwords, or lack of firewalls." },
    { q: "What is a 'Cyber Threat'?", a: "A potential event that could damage or steal digital data", options: ["A potential event that could damage or steal digital data", "A type of hardware that has become outdated and slow", "A software update that improves the system performance", "A user who has forgotten their own complex password"], hint: "The danger itself.", why: "Threats include hackers, malware, and even accidental data deletion." },
    { q: "What is cyber security?", a: "Protecting systems and data from unauthorised access or damage", options: ["Protecting systems and data from unauthorised access or damage", "Speeding up a computer network", "Backing up files to the cloud", "Designing secure buildings"], hint: "Protect the data.", why: "It covers processes and people as well as technology." },
    { q: "What does the term 'threat' mean in cyber security?", a: "Anything with the potential to cause harm to a system", options: ["Anything with the potential to cause harm to a system", "A weakness in a system's defences", "A backup of important data", "A firewall setting"], hint: "The danger itself.", why: "A vulnerability is the weakness; a threat is what might exploit it." },
    { q: "What is a vulnerability?", a: "A weakness that an attacker could exploit", options: ["A weakness that an attacker could exploit", "An attack that has already happened", "A type of antivirus software", "A strong password policy"], hint: "The gap in the defences.", why: "Unpatched software is a common example." },
    { q: "Why are people often called the weakest link in security?", a: "They can be tricked into revealing information", options: ["They can be tricked into revealing information", "They type more slowly than computers", "They cannot remember passwords at all", "They always install antivirus software"], hint: "Social engineering works.", why: "No firewall stops a user who willingly hands over their password." },
    { q: "What is the purpose of a penetration test?", a: "To find weaknesses by attacking a system with permission", options: ["To find weaknesses by attacking a system with permission", "To install updates automatically", "To delete old user accounts", "To measure network speed"], hint: "Authorised attack.", why: "It reveals vulnerabilities before a real attacker finds them." },
    { q: "What does 'unauthorised access' mean?", a: "Using a system without permission to do so", options: ["Using a system without permission to do so", "Logging in with your own account", "Reading a public website", "Backing up your own files"], hint: "No permission.", why: "It is an offence under the Computer Misuse Act." },
    { q: "Why is keeping software updated important?", a: "Updates fix known vulnerabilities attackers could exploit", options: ["Updates fix known vulnerabilities attackers could exploit", "Updates make the screen brighter", "Updates delete unwanted files", "Updates increase storage space"], hint: "Patch the holes.", why: "Attackers actively target known unpatched flaws." },
    { q: "What is the aim of most cyber attacks?", a: "To steal, alter or deny access to data", options: ["To steal, alter or deny access to data", "To improve system performance", "To install useful software", "To test the user's typing"], hint: "Data is the target.", why: "Data has value, whether financial, personal or commercial." },
    { q: "What is meant by data integrity?", a: "Data remaining accurate and unaltered", options: ["Data remaining accurate and unaltered", "Data being available at all times", "Data being kept secret", "Data being backed up nightly"], hint: "Unchanged and correct.", why: "An attack that quietly alters records damages integrity." },
    { q: "Why is a security policy needed as well as technology?", a: "It tells people how to behave safely", options: ["It tells people how to behave safely", "It replaces the need for a firewall", "It makes the network faster", "It encrypts all files automatically"], hint: "People need rules.", why: "Technical controls fail if staff bypass them." },
    { q: "What is the risk of using the same password everywhere?", a: "One breach exposes every account", options: ["One breach exposes every account", "Passwords expire more quickly", "The computer runs more slowly", "Accounts cannot be recovered"], hint: "One key, every door.", why: "Attackers try stolen credentials on other sites." },
    { q: "What is 'availability' in security terms?", a: "Systems and data being accessible when needed", options: ["Systems and data being accessible when needed", "Data being kept private", "Data being accurate", "Data being encrypted"], hint: "Can you get to it?", why: "A denial of service attack targets availability specifically." },
    { q: "Why do organisations train staff in cyber security?", a: "Many attacks succeed by deceiving people rather than machines", options: ["Many attacks succeed by deceiving people rather than machines", "Staff must be able to write antivirus software", "Training makes computers run faster", "It is required to install updates"], hint: "Humans are targeted.", why: "Recognising a suspicious email prevents most social engineering." },
    { q: "What should you do if you suspect a security breach?", a: "Report it immediately to the responsible person", options: ["Report it immediately to the responsible person", "Ignore it and keep working", "Delete all your own files", "Turn off the internet for everyone"], hint: "Escalate quickly.", why: "Fast reporting limits the damage an attacker can do." },
    { q: "Why is a backup a security measure?", a: "It allows recovery if data is destroyed or encrypted", options: ["It allows recovery if data is destroyed or encrypted", "It prevents all attacks from happening", "It speeds up the network", "It replaces the need for passwords"], hint: "Recover afterwards.", why: "Good backups are the main defence against ransomware." }
  ],
  "3.6.2.1 Social engineering": [
    { q: "What is 'Phishing' in social engineering?", a: "A deceptive email designed to steal user credentials", options: ["A deceptive email designed to steal user credentials", "A phone call where the hacker pretends to be an expert", "A physical attack where the hacker steals a hard drive", "A software virus that encrypts all the files on the disk"], hint: "Fake emails.", why: "Phishing relies on the user clicking a link or providing data via email." },
    { q: "What is 'Blagging' (or Pretexting)?", a: "Creating a fake scenario to trick someone into giving data", options: ["Creating a fake scenario to trick someone into giving data", "Trying every possible password until the correct one is found", "Overloading a network server so that it crashes for users", "Using a script to redirect a user to a malicious website"], hint: "Lying to get info.", why: "Blagging involves inventing a story (e.g., 'I am from IT support') to get info." },
    { q: "What is 'Shoulder Surfing'?", a: "Looking over a person's shoulder to see their PIN or password", options: ["Looking over a person's shoulder to see their PIN or password", "Sending a malicious email to a large group of people", "Using a computer to guess passwords at high speeds", "Inserting code into a database to steal user records"], hint: "Physical spying.", why: "It is a simple but effective way to steal secrets in public places." },
    { q: "What is 'Baiting' in social engineering?", a: "Leaving an infected USB drive for someone to find and use", options: ["Leaving an infected USB drive for someone to find and use", "Sending a fake invoice to a company to get them to pay", "Calling a user and pretending to be a helpful bank clerk", "Writing a malicious script that runs inside a web browser"], hint: "A physical 'lure'.", why: "Baiting exploits curiosity; a person finds a USB and plugs it in." },
    { q: "What is 'Quid Pro Quo' in social engineering?", a: "Offering a service or prize in exchange for information", options: ["Offering a service or prize in exchange for information", "Watching a person enter their secret code at an ATM", "Using a dictionary of words to guess a user's password", "Redirecting a user to a fake version of a popular website"], hint: "Something for something.", why: "A hacker might offer 'technical support' in exchange for a login." },
    { q: "How can you identify a Phishing email?", a: "Check for poor grammar and urgent, threatening language", options: ["Check for poor grammar and urgent, threatening language", "Check if the email was sent during the morning hours", "Check if the email contains any images or attachments", "Check if the email is addressed to your correct name"], hint: "Sense of urgency.", why: "Phishing often uses panic ('Account suspended!') to make people act fast." },
    { q: "What is 'Spear Phishing'?", a: "A targeted phishing attack aimed at a specific person", options: ["A targeted phishing attack aimed at a specific person", "A phishing attack that uses a malicious telephone call", "A phishing attack that targets every user on the internet", "A phishing attack that is performed by a computer virus"], hint: "Specific target.", why: "Spear phishing uses personal details to make the scam more believable." },
    { q: "What is 'Vishing'?", a: "A phishing attack that is carried out over the telephone", options: ["A phishing attack that is carried out over the telephone", "A phishing attack that uses a high-definition video file", "A phishing attack that targets the central processor unit", "A phishing attack that involves physical shoulder surfing"], hint: "Voice Phishing.", why: "Vishing (Voice Phishing) involves a caller pretending to be from a bank or IT." },
    { q: "Why is 'Human Curiosity' a risk in social engineering?", a: "It leads people to click links or open unknown files", options: ["It leads people to click links or open unknown files", "It makes the computer hardware run much slower over time", "It prevents the software from being updated automatically", "It causes the system to run out of memory during a task"], hint: "Curiosity kills the cat.", why: "Hackers use enticing subject lines or 'free' offers to bait users." },
    { q: "What is 'Tailgating'?", a: "Following an authorised person into a restricted area", options: ["Following an authorised person into a restricted area", "Looking at someone's screen while they are working", "Sending a malicious email to everyone in an office", "Trying to guess a password using common birthdays"], hint: "Entering a building.", why: "A physical social engineering technique to gain access to a site." },
    { q: "Which of these helps prevent social engineering?", a: "Regular staff training and a strong 'Security Culture'", options: ["Regular staff training and a strong 'Security Culture'", "Installing a faster processor and more system memory", "Using a high-definition monitor to see the screen better", "Buying a new keyboard that is harder for others to see"], hint: "Education.", why: "Awareness is the best defence against psychological manipulation." },
    { q: "What should you do if you receive a suspicious email?", a: "Delete it and report it to the IT department immediately", options: ["Delete it and report it to the IT department immediately", "Click the link to see if the website looks dangerous", "Reply to the sender to ask them to stop sending emails", "Forward it to all your friends to warn them of the scam"], hint: "Don't touch it.", why: "Never interact with suspicious content; report it so others are safe." },
    { q: "What is 'Pretexting'?", a: "Using a made-up story to gain trust and information", options: ["Using a made-up story to gain trust and information", "Using a powerful computer to break a secret encryption", "Using a software firewall to monitor the network traffic", "Using a biometric scanner to verify the identity of a user"], hint: "The story before the hit.", why: "Pretexting creates a plausible reason for the hacker to ask for data." },
    { q: "Is Social Engineering a 'Technical' attack?", a: "No, it is a psychological attack on the human user", options: ["No, it is a psychological attack on the human user", "Yes, it targets the binary logic of the central processor"], hint: "Think people vs machines.", why: "Social engineering exploits human error, not code vulnerabilities." },
    { q: "Why do hackers use 'Authority' in social engineering?", a: "People are more likely to obey someone in a high position", options: ["People are more likely to obey someone in a high position", "People are more likely to ignore an email from a manager", "It allows the hacker to bypass the software firewall", "It makes the malicious code run faster on the computer"], hint: "Respect for leaders.", why: "Pretending to be a CEO or 'Police' makes victims more compliant." },
    { q: "What is social engineering?", a: "Manipulating people into giving away information or access", options: ["Manipulating people into giving away information or access", "Writing software that breaks encryption", "Designing secure social networks", "Building physical security systems"], hint: "Target the human.", why: "It exploits trust and helpfulness rather than technical flaws." },
    { q: "What is phishing?", a: "Fake messages that trick users into revealing details", options: ["Fake messages that trick users into revealing details", "Flooding a server with traffic", "Guessing a password by brute force", "Installing hidden software on a device"], hint: "Bait and hook.", why: "Emails imitating a bank are the classic example." },
    { q: "Which is a common warning sign of a phishing email?", a: "A generic greeting and an urgent threat", options: ["A generic greeting and an urgent threat", "A message from a saved contact", "Correct spelling throughout", "An email with no links"], hint: "Urgency and vagueness.", why: "Urgency is used to stop the reader thinking carefully." },
    { q: "What is shouldering (shoulder surfing)?", a: "Watching someone enter their details in person", options: ["Watching someone enter their details in person", "Sending a fake email", "Flooding a network with data", "Installing a keylogger remotely"], hint: "Look over the shoulder.", why: "PINs are often observed at cash machines this way." },
    { q: "What is blagging (pretexting)?", a: "Inventing a scenario to persuade someone to hand over data", options: ["Inventing a scenario to persuade someone to hand over data", "Encrypting files for ransom", "Sending mass advertising emails", "Scanning a network for open ports"], hint: "A convincing story.", why: "An attacker may pose as IT support needing your password." },
    { q: "How can you check whether a link in an email is genuine?", a: "Hover over it and inspect the real destination", options: ["Hover over it and inspect the real destination", "Click it and see what happens", "Forward the email to a friend", "Reply asking if it is genuine"], hint: "Look before you click.", why: "The visible text can differ completely from the real address." },
    { q: "Why do attackers create a sense of urgency?", a: "To stop the victim thinking carefully or checking", options: ["To stop the victim thinking carefully or checking", "To make the email shorter", "To avoid spam filters", "To improve their spelling"], hint: "Panic prevents checking.", why: "'Your account closes in one hour' pushes people to act rashly." },
    { q: "What is the best response to an unexpected request for your password?", a: "Refuse and verify through a known official channel", options: ["Refuse and verify through a known official channel", "Provide it if the sender sounds official", "Send it to a colleague to check", "Change it and then send the new one"], hint: "Verify independently.", why: "Legitimate organisations never ask for your password." },
    { q: "Why is social engineering hard to defend against with technology alone?", a: "It targets human judgement rather than the system", options: ["It targets human judgement rather than the system", "It only works on very old computers", "Firewalls block it automatically", "It requires physical access every time"], hint: "People, not machines.", why: "Training and awareness are the main defences." },
    { q: "What is 'spear phishing'?", a: "A phishing attack aimed at a specific individual", options: ["A phishing attack aimed at a specific individual", "Phishing sent to millions at random", "Phishing carried out by phone only", "Phishing using printed letters"], hint: "Targeted and researched.", why: "Personal details make the message far more convincing." },
    { q: "Which detail in an email address suggests a fake?", a: "A domain that is subtly misspelled", options: ["A domain that is subtly misspelled", "An address ending in .com", "An address containing a full stop", "An address with the sender's name"], hint: "Look closely at the domain.", why: "Attackers register domains that look almost identical to the real one." },
    { q: "How does a phishing site steal credentials?", a: "It copies the real login page and records what is typed", options: ["It copies the real login page and records what is typed", "It guesses the password automatically", "It encrypts the user's hard disk", "It floods the real site with traffic"], hint: "A convincing fake.", why: "Victims believe they are logging in normally." },
    { q: "What should an organisation do after a successful phishing attack?", a: "Change affected credentials and review staff training", options: ["Change affected credentials and review staff training", "Ignore it if nothing was stolen", "Delete the email and say nothing", "Disconnect from the internet permanently"], hint: "Contain then learn.", why: "Stopping the immediate risk and preventing repeats both matter." },
    { q: "Why might an attacker research a target on social media first?", a: "Personal details make their approach more believable", options: ["Personal details make their approach more believable", "Social media reveals passwords directly", "It is required to send an email", "It bypasses the firewall"], hint: "Build a convincing story.", why: "Naming a real colleague or project greatly increases credibility." },
    { q: "Which is a sensible policy against shouldering?", a: "Shield the keypad when entering a PIN", options: ["Shield the keypad when entering a PIN", "Say the PIN aloud to remember it", "Write the PIN on the card", "Use the same PIN everywhere"], hint: "Block the view.", why: "Simple physical precautions defeat casual observation." }
  ],

  "3.6.2.2 Malicious code (malware)": [
    { q: "What is a 'Computer Virus'?", a: "Malware that attaches to a file and needs a user to run it", options: ["Malware that attaches to a file and needs a user to run it", "Malware that can spread by itself across a network", "Hardware that has physically broken due to old age", "A type of software used to protect against cyber attacks"], hint: "Needs a host.", why: "Viruses require human action (like opening an attachment) to spread." },
    { q: "What is a 'Computer Worm'?", a: "Malware that can self-replicate and spread across networks", options: ["Malware that can self-replicate and spread across networks", "Malware that hides inside a useful-looking programme", "Hardware that consumes too much electrical energy", "A deceptive email designed to steal a user's password"], hint: "Self-spreading.", why: "Worms don't need a host file; they spread automatically via networks." },
    { q: "What is a 'Trojan Horse'?", a: "Malware disguised as legitimate or useful software", options: ["Malware disguised as legitimate or useful software", "Malware that encrypts files and demands a payment", "A physical device used to intercept network data", "A type of software used to compress large image files"], hint: "Deceptive gift.", why: "Trojans look like games or tools but contain hidden malicious code." },
    { q: "What is 'Ransomware'?", a: "Malware that encrypts files and demands money for a key", options: ["Malware that encrypts files and demands money for a key", "Malware that records every single keypress by the user", "A hardware component used to store binary data permanently", "A deceptive email that tricks a user into giving a PIN"], hint: "Paying for your files.", why: "Ransomware locks your data until you pay a fee (usually in Bitcoin)." },
    { q: "What is 'Spyware'?", a: "Malware that secretly monitors and records user activity", options: ["Malware that secretly monitors and records user activity", "Malware that deletes the operating system from the disk", "A hardware device used to speed up the central processor", "A type of software used to back up important documents"], hint: "Watching you.", why: "Spyware steals info like passwords or browsing habits without you knowing." },
    { q: "What is an 'Adware' programme?", a: "Malware that forces unwanted advertisements on the user", options: ["Malware that forces unwanted advertisements on the user", "Malware that prevents the user from accessing the internet", "A software tool used to create professional digital art", "A hardware component used to display high-quality video"], hint: "Annoying pop-ups.", why: "Adware generates revenue for hackers by showing intrusive ads." },
    { q: "What is a 'Keylogger'?", a: "Malware that records every keystroke made on a keyboard", options: ["Malware that records every keystroke made on a keyboard", "Malware that prevents the computer from starting up", "A physical lock used to secure a computer to a desk", "A type of software used to count the words in a file"], hint: "Stealing passwords.", why: "Keyloggers are often used to steal passwords as you type them." },
    { q: "What is 'Rootkit' malware?", a: "Malware that gives a hacker full control over the system", options: ["Malware that gives a hacker full control over the system", "Malware that only affects the root folder of the drive", "A hardware device used to connect a PC to the internet", "A type of software used to format a new hard disk drive"], hint: "Admin access.", why: "Rootkits allow hackers to hide their presence and stay in control." },
    { q: "How does a 'Worm' typically spread?", a: "By exploiting vulnerabilities in network protocols", options: ["By exploiting vulnerabilities in network protocols", "By a user manually copying the file onto a USB drive", "By a user opening a malicious attachment in an email", "By a hacker physically entering the server room site"], hint: "Automatic network travel.", why: "Worms travel through network 'holes' without human help." },
    { q: "What is a 'Logic Bomb'?", a: "Malware that triggers when a specific condition is met", options: ["Malware that triggers when a specific condition is met", "Malware that causes the computer to physically explode", "A software tool used to calculate complex math logic", "A hardware component used to process binary signals"], hint: "Timed attack.", why: "A logic bomb might trigger on a certain date or when a file is deleted." },
    { q: "What is 'Botnet' malware?", a: "Malware that turns a computer into a remotely controlled zombie", options: ["Malware that turns a computer into a remotely controlled zombie", "Malware that increases the storage space of the hard drive", "A type of software used to manage a local area network", "A hardware device used to boost the wireless signal range"], hint: "Network of robots.", why: "Botnets are used to launch massive DDoS attacks or send spam." },
    { q: "Which of these is a sign of a Malware infection?", a: "The computer runs slowly and shows unexpected pop-ups", options: ["The computer runs slowly and shows unexpected pop-ups", "The monitor displays a high-definition image very clearly", "The keyboard allows the user to type at a very fast speed", "The battery of the laptop lasts much longer than before"], hint: "Strange behaviour.", why: "Slowness, crashes, and pop-ups are classic signs of malware." },
    { q: "How can you prevent a 'Virus' infection?", a: "Using up-to-date antivirus software and being cautious", options: ["Using up-to-date antivirus software and being cautious", "Buying a new computer every single month for security", "Removing the battery from the laptop when not in use", "Using a high-quality cable for the internet connection"], hint: "Antivirus.", why: "Antivirus scans files for known signatures of malicious code." },
    { q: "What is 'Scareware'?", a: "Malware that tricks users into thinking they have a virus", options: ["Malware that tricks users into thinking they have a virus", "Malware that causes the screen to turn off permanently", "A hardware device that makes a loud noise when moved", "A type of software used to edit scary movie soundtracks"], hint: "Fake warnings.", why: "Scareware uses fake pop-ups to trick you into buying 'repair' software." },
    { q: "Can malware affect a smartphone?", a: "Yes (it can be infected through apps or malicious links)", options: ["Yes (it can be infected through apps or malicious links)", "No (malware only affects desktop or laptop computers)"], hint: "Phones are computers too.", why: "Smartphones run software and are connected to the internet, making them targets." },
    { q: "What is malware?", a: "Software written to damage or gain access to a system", options: ["Software written to damage or gain access to a system", "Software that has a minor bug in it", "Software that runs slowly", "Software that is out of date"], hint: "Malicious software.", why: "The intent to harm is what makes code malware." },
    { q: "What makes a worm different from a virus?", a: "A worm spreads by itself without user action", options: ["A worm spreads by itself without user action", "A worm needs a host file to attach to", "A worm cannot travel over a network", "A worm only affects printers"], hint: "Self-replicating.", why: "Worms exploit network vulnerabilities to spread automatically." },
    { q: "What is a trojan?", a: "Malware disguised as legitimate software", options: ["Malware disguised as legitimate software", "Malware that replicates without help", "Software that encrypts files for ransom", "A program that records keystrokes"], hint: "A gift that is not.", why: "The user installs it willingly, believing it to be useful." },
    { q: "What does ransomware do?", a: "Encrypts files and demands payment to restore them", options: ["Encrypts files and demands payment to restore them", "Deletes the operating system instantly", "Records every website visited", "Sends spam from your address"], hint: "Pay to get them back.", why: "Reliable backups are the best protection against it." },
    { q: "What does spyware do?", a: "Secretly gathers information about the user", options: ["Secretly gathers information about the user", "Encrypts the hard disk", "Sends the computer to sleep", "Blocks all incoming email"], hint: "Watching quietly.", why: "It may capture browsing habits, logins or card details." },
    { q: "What is a keylogger?", a: "Software or hardware that records every key pressed", options: ["Software or hardware that records every key pressed", "A program that locks the keyboard", "A device that speeds up typing", "A backup of typed documents"], hint: "Records keystrokes.", why: "Passwords are captured as they are typed." },
    { q: "How does a virus typically spread?", a: "By being attached to a file the user opens or shares", options: ["By being attached to a file the user opens or shares", "By travelling alone across a network", "By being printed onto paper", "By being installed by the manufacturer"], hint: "Needs a host and a click.", why: "Unlike a worm, it relies on user action to activate." },
    { q: "Why is a trojan effective?", a: "Users install it themselves, bypassing suspicion", options: ["Users install it themselves, bypassing suspicion", "It spreads without any network", "It cannot be detected by any software", "It only runs on servers"], hint: "Willing installation.", why: "Appearing useful is what gets it past the user's judgement." },
    { q: "What should you do if ransomware encrypts your files?", a: "Restore from a clean backup rather than paying", options: ["Restore from a clean backup rather than paying", "Pay immediately to recover them", "Reinstall the same infected software", "Send the files to another computer"], hint: "Backups win.", why: "Paying funds the attackers and does not guarantee recovery." },
    { q: "How does antivirus software usually detect known malware?", a: "By comparing files against a database of signatures", options: ["By comparing files against a database of signatures", "By deleting every new file", "By blocking the internet connection", "By encrypting the hard disk"], hint: "Known patterns.", why: "This is why signature databases must be kept up to date." },
    { q: "Why can new malware evade signature-based detection?", a: "Its signature is not yet in the database", options: ["Its signature is not yet in the database", "It is too small to scan", "It runs only at night", "Antivirus ignores new files"], hint: "Not yet known.", why: "Behaviour-based detection helps catch previously unseen threats." },
    { q: "What is a botnet?", a: "A network of infected machines controlled remotely", options: ["A network of infected machines controlled remotely", "A backup system for servers", "A tool for testing networks", "A type of firewall"], hint: "An army of zombies.", why: "Botnets are often used to launch denial of service attacks." },
    { q: "Which behaviour might suggest a malware infection?", a: "The computer slows down and shows unexpected pop-ups", options: ["The computer slows down and shows unexpected pop-ups", "The screen brightness changes at sunset", "Files open when double-clicked", "The clock keeps correct time"], hint: "Unexplained changes.", why: "Malware consumes resources and often alters normal behaviour." },
    { q: "How does malware often arrive on a home computer?", a: "Through an email attachment or an untrusted download", options: ["Through an email attachment or an untrusted download", "Through the mains electricity supply", "Through the monitor cable", "Through the printer"], hint: "Files from outside.", why: "Only downloading from trusted sources greatly reduces the risk." },
    { q: "Why is malware that steals data worse than malware that just slows a PC?", a: "Stolen personal data can cause lasting financial harm", options: ["Stolen personal data can cause lasting financial harm", "Slow computers cannot be repaired", "Data theft is easier to detect", "Slow computers lose all their files"], hint: "Data has lasting value.", why: "A slow machine can be fixed; leaked identity data cannot be recalled." }
  ],

  "3.6.3 Methods to detect and prevent": [
    { q: "What is the role of 'Antivirus' software?", a: "To scan files for known malicious code signatures", options: ["To scan files for known malicious code signatures", "To prevent unauthorised people from entering the building", "To encrypt all user files so they remain secret and safe", "To speed up the central processor by deleting large files"], hint: "Scanning and cleaning.", why: "Antivirus identifies and removes malware before it can do harm." },
    { q: "What is a 'Firewall'?", a: "Software or hardware that monitors network traffic", options: ["Software or hardware that monitors network traffic", "A physical wall made of fire-resistant material in a lab", "A type of software used to compress large image files", "A hardware component used to store binary data units"], hint: "Filtering traffic.", why: "Firewalls block unauthorised incoming and outgoing network data." },
    { q: "What is 'Encryption'?", a: "Scrambling data using a key so it cannot be read", options: ["Scrambling data using a key so it cannot be read", "Making a file smaller so that it is faster to download", "Checking if an input value is within a specific range", "Creating a copy of data in case the original is lost"], hint: "Keeping it secret.", why: "Encryption ensures that intercepted data is useless to a hacker." },
    { q: "What is 'User Authentication'?", a: "Verifying the identity of a user before granting access", options: ["Verifying the identity of a user before granting access", "Deleting a user's account once they have finished work", "Creating a new password for every single day of the week", "Allowing any person to use the computer without a login"], hint: "Who are you?", why: "Authentication (like passwords or biometrics) ensures only authorised access." },
    { q: "Which of these is 'Multi-factor Authentication' (MFA)?", a: "Requiring a password and a code sent to a phone", options: ["Requiring a password and a code sent to a phone", "Requiring a very long password with many special symbols", "Requiring a user to change their password every month", "Requiring a user to enter their password two times"], hint: "Two or more steps.", why: "MFA adds an extra layer of security beyond just a password." },
    { q: "What is a 'Biometric' security measure?", a: "Using unique physical traits like fingerprints for access", options: ["Using unique physical traits like fingerprints for access", "Using a complex numerical PIN for the entry gate", "Using a physical plastic key to open the server room", "Using a software password that is very hard to guess"], hint: "Your body is the key.", why: "Biometrics (face, iris, fingerprints) are hard to forge or steal." },
    { q: "What is the purpose of 'Automatic Updates'?", a: "To ensure security holes are fixed as soon as possible", options: ["To ensure security holes are fixed as soon as possible", "To make the software look more attractive to the user", "To reduce the amount of memory used by the programme", "To prevent the user from making any more syntax errors"], hint: "Patching holes.", why: "Updates contain 'patches' for vulnerabilities that hackers might use." },
    { q: "What is 'MAC Address Filtering'?", a: "Only allowing specific hardware devices onto a network", options: ["Only allowing specific hardware devices onto a network", "Blocking any website that has 'MAC' in the domain name", "Encrypting the data sent between the NIC and the router", "Changing the IP address of a computer every single hour"], hint: "Device control.", why: "Filters allow you to list the exact devices allowed on your Wi-Fi." },
    { q: "What is 'Input Sanitisation'?", a: "Cleaning user input of harmful characters or code", options: ["Cleaning user input of harmful characters or code", "Ensuring the user has typed their name in capital letters", "Deleting the input variable as soon as it has been used", "Printing the input value to the monitor for the user"], hint: "Safe forms.", why: "Sanitisation helps prevent attacks like SQL Injection." },
    { q: "Why is 'Staff Training' a security measure?", a: "Educated staff are less likely to fall for social engineering", options: ["Educated staff are less likely to fall for social engineering", "Educated staff can fix their own hardware if it breaks", "Educated staff can write their own complex algorithms", "Educated staff can type much faster on the keyboard"], hint: "People power.", why: "Training helps staff recognise phishing, vishing, and other scams." },
    { q: "What is an 'Access Control List' (ACL)?", a: "A list of which users have permission to see files", options: ["A list of which users have permission to see files", "A list of all the hardware components in the system", "A list of all the syntax errors found in the source code", "A list of the websites a user has visited in a day"], hint: "Permissions.", why: "ACLs define who can read, write, or delete specific data." },
    { q: "What is a 'Physical' security prevention method?", a: "Locking the server room door and using security guards", options: ["Locking the server room door and using security guards", "Installing the latest version of the antivirus software", "Using a 256-bit encryption key for all stored data", "Setting a complex 12-character password for the OS"], hint: "Real-world locks.", why: "Physical security stops thieves from touching or stealing the server." },
    { q: "What is 'Data Backup'?", a: "Making a copy of data to recover it after a loss", options: ["Making a copy of data to recover it after a loss", "Making data smaller so it takes up less space on disk", "Making data secret so that nobody else can read it", "Making data execute faster on the central processor"], hint: "Safety net.", why: "Backups are essential for recovery from ransomware or hardware failure." },
    { q: "Why use 'Penetration Testing' for prevention?", a: "To find weaknesses before an actual hacker does", options: ["To find weaknesses before an actual hacker does", "To increase the physical clock speed of the processor", "To make the operating system more user-friendly", "To allow the system to store more files on the drive"], hint: "Proactive testing.", why: "Ethical hackers try to break in to show the owner where to fix gaps." },
    { q: "What is 'Whitelisting' in security?", a: "Allowing only approved programmes or users access", options: ["Allowing only approved programmes or users access", "Blocking specific websites that are known to be safe", "Deleting all files that are not written in English", "Adding extra metadata to a compressed binary file"], hint: "Permission only.", why: "Whitelisting is safer than blacklisting because it blocks everything by default." },
    { q: "What does a firewall do?", a: "Filters traffic entering or leaving a network", options: ["Filters traffic entering or leaving a network", "Removes viruses from files", "Encrypts files on the hard disk", "Backs up data automatically"], hint: "A gatekeeper.", why: "Rules decide which traffic is allowed through." },
    { q: "What is encryption?", a: "Scrambling data so only someone with the key can read it", options: ["Scrambling data so only someone with the key can read it", "Compressing data to save space", "Deleting data securely", "Copying data to a second disk"], hint: "Unreadable without the key.", why: "Intercepted data is useless without the decryption key." },
    { q: "Does encryption stop data being stolen?", a: "No, but it makes stolen data unreadable", options: ["No, but it makes stolen data unreadable", "Yes, it prevents all theft", "Yes, it deletes data if copied", "No, it has no security benefit"], hint: "Useless to the thief.", why: "Encryption limits the damage rather than preventing the breach." },
    { q: "What is two-factor authentication?", a: "Proving identity with two different types of evidence", options: ["Proving identity with two different types of evidence", "Using two passwords of the same kind", "Logging in from two devices at once", "Having two user accounts"], hint: "Something you know and something you have.", why: "A stolen password alone is then not enough to log in." },
    { q: "What makes a password strong?", a: "Length and a mix of character types", options: ["Length and a mix of character types", "Being short and easy to type", "Being your pet's name", "Being the same on every site"], hint: "Long and varied.", why: "Length matters most because it multiplies the combinations." },
    { q: "What is MAC address filtering?", a: "Allowing only listed devices to join a network", options: ["Allowing only listed devices to join a network", "Blocking specific websites", "Scanning files for viruses", "Encrypting wireless traffic"], hint: "An allowed-device list.", why: "It is a useful extra layer, though addresses can be spoofed." },
    { q: "What are user access levels for?", a: "Limiting each user to only the data they need", options: ["Limiting each user to only the data they need", "Making the network faster", "Reducing the number of passwords", "Backing up user files"], hint: "Need to know.", why: "A pupil should not be able to open staff records." },
    { q: "Why should backups be stored away from the main system?", a: "A fire, theft or attack could destroy both otherwise", options: ["A fire, theft or attack could destroy both otherwise", "Backups take up less space remotely", "It makes the backup run faster", "Remote backups need no password"], hint: "Separate the copies.", why: "Ransomware can encrypt backups attached to the same machine." },
    { q: "What is anti-malware software for?", a: "Detecting and removing malicious software", options: ["Detecting and removing malicious software", "Speeding up the processor", "Managing user passwords", "Compressing large files"], hint: "Find and remove.", why: "It scans files and monitors behaviour for known threats." },
    { q: "Why is physical security part of cyber security?", a: "An attacker with physical access can bypass many controls", options: ["An attacker with physical access can bypass many controls", "Physical locks encrypt data", "Servers cannot be moved", "Physical security speeds up networks"], hint: "Lock the server room.", why: "Someone at the machine can often defeat software protections." },
    { q: "What is the purpose of a software patch?", a: "To fix a known fault or security weakness", options: ["To fix a known fault or security weakness", "To add advertising to a program", "To delete old user files", "To change the program's colours"], hint: "Close the hole.", why: "Prompt patching removes vulnerabilities before they are exploited." },
    { q: "Why is a shared staff password a poor idea?", a: "Actions cannot be traced to an individual", options: ["Actions cannot be traced to an individual", "It is harder to remember", "It cannot be typed quickly", "It expires too often"], hint: "No accountability.", why: "Individual accounts create an audit trail." },
    { q: "What does biometric authentication use?", a: "A physical characteristic such as a fingerprint", options: ["A physical characteristic such as a fingerprint", "A password typed on a keyboard", "A number sent by text message", "A physical key card"], hint: "Part of you.", why: "It cannot be forgotten, though it also cannot be changed if compromised." },
    { q: "Why should default passwords on new devices be changed?", a: "They are widely published and easily guessed", options: ["They are widely published and easily guessed", "They expire after one day", "They cannot be typed on a phone", "They use too much memory"], hint: "Everyone knows them.", why: "Attackers scan for devices still using factory defaults." },
    { q: "What is the benefit of automatic updates?", a: "Security fixes are applied without relying on the user", options: ["Security fixes are applied without relying on the user", "The computer runs at a higher clock speed", "Files are compressed automatically", "Passwords are changed each week"], hint: "No forgetting.", why: "Most breaches exploit flaws that had a fix available." }
  ],
  "3.7.1 Relational databases": [
    { q: "What is the primary definition of a 'Relational Database'?", a: "A collection of data tables linked together by common fields", options: ["A collection of data tables linked together by common fields", "A single large text file containing unorganised numerical data", "A hardware component used to store high-speed binary signals", "A software programme used to encrypt sensitive user documents"], hint: "Linked tables.", why: "Relational databases use keys to connect data across different tables." },
    { q: "What is a 'Primary Key' in a database table?", a: "A unique identifier for every individual record in a table", options: ["A unique identifier for every individual record in a table", "A field that contains the most important data in the record", "A secondary storage device used to back up the database file", "A password used to prevent unauthorised users from viewing data"], hint: "Unique ID.", why: "A primary key ensures that every row in a table can be uniquely identified." },
    { q: "What is a 'Foreign Key'?", a: "A primary key from one table used in another to link them", options: ["A primary key from one table used in another to link them", "A secret code used to access a database over a wide network", "A field that contains data written in a foreign human language", "A type of hardware used to connect the database to the internet"], hint: "The link between tables.", why: "Foreign keys create the relationship between two separate tables." },
    { q: "What is a 'Record' in the context of a database?", a: "A single row containing all data about one specific entity", options: ["A single row containing all data about one specific entity", "A single column containing one type of data for all users", "The name given to the entire collection of tables in a file", "The physical hardware disk where the database is stored"], hint: "A row.", why: "A record (or row) represents a single item, like a student or a product." },
    { q: "What is a 'Field' in the context of a database?", a: "A single column representing one specific category of data", options: ["A single column representing one specific category of data", "A collection of multiple records grouped together in a list", "The unique name of the person who created the database file", "The software used to perform a search within the data tables"], hint: "A column.", why: "Fields define the attributes of the records, such as 'Surname' or 'Price'." },
    { q: "What is 'Referential Integrity'?", a: "Ensuring that foreign keys always point to valid primary keys", options: ["Ensuring that foreign keys always point to valid primary keys", "Ensuring that the database is encrypted using a secret key", "Ensuring that every field in the table contains numerical data", "Ensuring that the database file is smaller than one megabyte"], hint: "Consistent links.", why: "Referential integrity prevents 'orphaned' records that point to non-existent data." },
    { q: "Which of these is a 'One-to-Many' relationship?", a: "One customer having many different individual orders", options: ["One customer having many different individual orders", "One person having one unique national insurance number", "One student being taught by one specific private tutor", "Many authors writing many different books for a library"], hint: "1 to Many.", why: "A single entity (customer) can relate to multiple entries (orders) in another table." },
    { q: "What is the purpose of 'Data Redundancy'?", a: "Repeating the same data unnecessarily in multiple places", options: ["Repeating the same data unnecessarily in multiple places", "Creating a backup copy of the data in case of hardware failure", "Organising the data into a logical and sequential numerical order", "Identifying and fixing logic errors found within the database"], hint: "Wasted space.", why: "Redundancy is generally avoided as it wastes space and causes consistency issues." },
    { q: "What is 'Data Normalisation'?", a: "The process of organising a database to reduce redundancy", options: ["The process of organising a database to reduce redundancy", "The process of converting all numerical data into binary code", "The process of scanning the database for malicious software", "The process of uploading the database to a remote web server"], hint: "Organising efficiently.", why: "Normalisation involves splitting tables to ensure data is stored only once." },
    { q: "Why use a Relational Database over a Flat File?", a: "It is easier to update data and prevents inconsistencies", options: ["It is easier to update data and prevents inconsistencies", "It is much simpler for a novice to create and maintain manually", "It requires significantly less system memory to run the software", "It does not require the use of any primary or foreign keys"], hint: "Avoids 'Flat' problems.", why: "Relational databases are more efficient for complex, linked data sets." },
    { q: "What is a 'Flat File' database?", a: "A single table that stores all data in one large block", options: ["A single table that stores all data in one large block", "A database that is stored on a very thin secondary disk", "A database that only contains two-dimensional image files", "A database that has been compressed to save storage space"], hint: "One single table.", why: "Flat files are simple but lead to redundancy in complex systems." },
    { q: "Which field would be the best Primary Key for a student?", a: "A unique Student ID number assigned by the school", options: ["A unique Student ID number assigned by the school", "The student's first name and their middle initial", "The student's date of birth and their current home address", "The student's predicted grade for their computer science exam"], hint: "Must be unique.", why: "Names and dates can be identical; an ID is guaranteed to be unique." },
    { q: "What does 'DBMS' stand for?", a: "Database Management System (the software that runs it)", options: ["Database Management System (the software that runs it)", "Data Binary Modification Speed (the processing rate)", "Digital Backup Memory Storage (the hardware capacity)", "Direct Business Messaging Service (the communication tool)"], hint: "The software controller.", why: "A DBMS (like MySQL or Access) is the software used to interact with the database." },
    { q: "What is 'Data Consistency'?", a: "Ensuring that data is the same across all related tables", options: ["Ensuring that data is the same across all related tables", "Ensuring that the database remains at a fixed physical size", "Ensuring that the database is accessible only during the day", "Ensuring that every record is written in the same language"], hint: "No conflicting info.", why: "If a name changes in one table, it should be correct in all linked tables." },
    { q: "What is a 'Compound Key'?", a: "A primary key made up of two or more combined fields", options: ["A primary key made up of two or more combined fields", "A key used to encrypt the entire database for security", "A key that connects the database to a remote cloud server", "A key that is used to sort the data in descending order"], hint: "Joined keys.", why: "Compound keys are used when no single field can uniquely identify a record." },
    { q: "What is a primary key?", a: "A field that uniquely identifies each record in a table", options: ["A field that uniquely identifies each record in a table", "A field that links to another table", "The first field in the table", "A field that must be encrypted"], hint: "Unique per record.", why: "Without it, two identical records could not be told apart." },
    { q: "What is a foreign key?", a: "A field that refers to the primary key of another table", options: ["A field that refers to the primary key of another table", "A key used to encrypt the database", "The last field in a table", "A duplicate of the primary key"], hint: "It points elsewhere.", why: "Foreign keys are what create the relationship between tables." },
    { q: "In a database table, what is a record?", a: "One complete row of data about a single item", options: ["One complete row of data about a single item", "One column in a table", "The name of the table", "A single character of data"], hint: "A whole row.", why: "A pupil record holds all the fields for one pupil." },
    { q: "What is a field?", a: "A single column holding one attribute", options: ["A single column holding one attribute", "A whole row of data", "An entire table", "A relationship between tables"], hint: "One attribute.", why: "Surname and date of birth would each be a field." },
    { q: "Why split data into related tables?", a: "It avoids storing the same data repeatedly", options: ["It avoids storing the same data repeatedly", "It makes the database file larger", "It removes the need for keys", "It prevents any searching"], hint: "Avoid duplication.", why: "Storing a teacher's details once avoids inconsistent copies." },
    { q: "What problem does data redundancy cause?", a: "The same fact may be updated in one place but not another", options: ["The same fact may be updated in one place but not another", "Records become impossible to delete", "Tables cannot be linked", "Fields lose their data types"], hint: "Inconsistency.", why: "Duplicated data drifts out of step over time." },
    { q: "What is a flat file database?", a: "All data held in a single table", options: ["All data held in a single table", "Data spread across many linked tables", "A database with no fields", "A database stored on paper"], hint: "One table only.", why: "Flat files suffer badly from redundancy as they grow." },
    { q: "Which relationship links one teacher to many pupils?", a: "One-to-many", options: ["One-to-many", "One-to-one", "Many-to-many", "None-to-one"], hint: "One on the left, many on the right.", why: "The many side holds a foreign key pointing back to the one side." },
    { q: "Why must a primary key be unique?", a: "So every record can be identified without ambiguity", options: ["So every record can be identified without ambiguity", "So the table can be sorted alphabetically", "So the field can be encrypted", "So the table uses less storage"], hint: "No duplicates allowed.", why: "Duplicate keys would make it impossible to target one record." },
    { q: "What data type suits a 'date of birth' field?", a: "Date", options: ["Date", "Boolean", "Integer", "Character"], hint: "Match the content.", why: "A date type allows sorting and age calculations." },
    { q: "What is an entity in a database?", a: "A thing about which data is stored, such as a pupil", options: ["A thing about which data is stored, such as a pupil", "A single value in a field", "The name of the database software", "A query used to search"], hint: "Usually becomes a table.", why: "Each entity typically becomes one table." },
    { q: "Why is a candidate key useful?", a: "It is a field that could serve as the primary key", options: ["It is a field that could serve as the primary key", "It links two tables together", "It stores a backup of the record", "It sorts the table automatically"], hint: "A possible unique identifier.", why: "The designer picks the most suitable candidate as the primary key." },
    { q: "What happens if a foreign key refers to a deleted record?", a: "The relationship breaks, leaving orphaned data", options: ["The relationship breaks, leaving orphaned data", "The database deletes itself", "The foreign key becomes a primary key", "Nothing is affected"], hint: "Referential integrity.", why: "Databases enforce rules to prevent this happening." },
    { q: "Which is the best primary key for a pupil table?", a: "A unique pupil ID number", options: ["A unique pupil ID number", "The pupil's surname", "The pupil's year group", "The pupil's town"], hint: "Must be unique.", why: "Names and towns repeat, so they cannot identify a record reliably." },
    { q: "What is the advantage of a relational database over a flat file?", a: "Less duplication and easier, more consistent updating", options: ["Less duplication and easier, more consistent updating", "It needs no primary keys", "It can only store numbers", "It cannot be searched"], hint: "Structure pays off.", why: "Changing one linked record updates the fact everywhere it is used." }
  ],

  "3.7.2 Structured query language (SQL)": [
    { q: "What is the purpose of the 'SELECT' command?", a: "To specify which fields you want to retrieve from a table", options: ["To specify which fields you want to retrieve from a table", "To delete a specific record from the database permanently", "To create a brand new table with a unique primary key", "To update an existing record with a new data value"], hint: "Picking columns.", why: "SELECT defines the columns that will appear in your results." },
    { q: "What is the purpose of the 'FROM' command?", a: "To specify which table the data should be retrieved from", options: ["To specify which table the data should be retrieved from", "To specify the condition that the data must meet to show", "To specify the order in which the results should be sorted", "To specify the name of the user who is performing the search"], hint: "Identifying the table.", why: "FROM tells the database which table to look into." },
    { q: "What is the purpose of the 'WHERE' command?", a: "To filter records based on a specific logical condition", options: ["To filter records based on a specific logical condition", "To select all the fields within a specific database table", "To join two separate tables using a common foreign key", "To change the name of a field within an existing record"], hint: "Filtering rows.", why: "WHERE allows you to only see data that matches your criteria." },
    { q: "What does the '*' symbol mean in a SELECT statement?", a: "Retrieve every single field from the specified table", options: ["Retrieve every single field from the specified table", "Multiply two numerical fields together in the results", "Search for records that contain a specific text string", "Delete the entire contents of the specified database table"], hint: "Select all.", why: "SELECT * is a wildcard meaning 'all columns'." },
    { q: "Which SQL command is used to add a new record?", a: "INSERT INTO (adding a new row of data to the table)", options: ["INSERT INTO (adding a new row of data to the table)", "UPDATE (modifying data that is already in the table)", "CREATE TABLE (defining a new structure for the data)", "SELECT (retrieving data from the existing records)"], hint: "Adding data.", why: "INSERT INTO adds a new row to a table." },
    { q: "Which command is used to modify existing data?", a: "UPDATE (changing values within an existing record)", options: ["UPDATE (changing values within an existing record)", "INSERT INTO (adding a new row of data to the table)", "DELETE (removing a specific record from the database)", "WHERE (filtering the results based on a condition)"], hint: "Editing data.", why: "UPDATE is used to change data that is already stored." },
    { q: "Which command is used to remove a record?", a: "DELETE FROM (removing a row based on a condition)", options: ["DELETE FROM (removing a row based on a condition)", "DROP TABLE (removing the entire table structure)", "REMOVE (a non-standard command for deleting data)", "CLEAR (a non-standard command for emptying a table)"], hint: "Removing rows.", why: "DELETE FROM is used with WHERE to remove specific rows." },
    { q: "How do you sort results in SQL?", a: "ORDER BY (followed by ASC or DESC for direction)", options: ["ORDER BY (followed by ASC or DESC for direction)", "SORT BY (followed by the name of the field to use)", "ARRANGE (followed by the numerical index of the field)", "GROUP BY (followed by the category of the data items)"], hint: "Ordering.", why: "ORDER BY sorts the output of your query." },
    { q: "What is 'ASC' and 'DESC' in SQL?", a: "Ascending (A-Z) and Descending (Z-A) sort orders", options: ["Ascending (A-Z) and Descending (Z-A) sort orders", "Ascribed and Described metadata for the search query", "Alternative and Default conditions for the WHERE clause", "Advanced and Simple commands for the database search"], hint: "Sort directions.", why: "These keywords define the direction of the ORDER BY command." },
    { q: "Which operator is used for 'Not Equal to' in most SQL?", a: "<> (or sometimes != depending on the specific system)", options: ["<> (or sometimes != depending on the specific system)", "== (used for comparing two identical values)", "NOT (used for inverting a logical boolean state)", "!! (used for expressing an urgent command to the CPU)"], hint: "Diamond operator.", why: "<> is the traditional SQL operator for inequality." },
    { q: "What is the purpose of the 'LIKE' operator?", a: "To search for a specific pattern within a text field", options: ["To search for a specific pattern within a text field", "To compare two numerical values for exact equality", "To join two different tables using a primary key link", "To increase the speed of the search across the network"], hint: "Pattern matching.", why: "LIKE is often used with wildcards to find partial text matches." },
    { q: "What is the '%' wildcard used for with LIKE?", a: "To represent any number of characters in a pattern", options: ["To represent any number of characters in a pattern", "To calculate a percentage of the total numerical values", "To find the remainder of a division operation in a query", "To hide the data from users who do not have a password"], hint: "Wildcard symbol.", why: "In SQL, '%' matches any sequence of characters." },
    { q: "Which SQL command is used to create a new table?", a: "CREATE TABLE (defining the fields and data types)", options: ["CREATE TABLE (defining the fields and data types)", "NEW TABLE (a non-standard command for structures)", "INSERT INTO (adding data to an existing structure)", "SELECT (retrieving data from an existing table)"], hint: "Building the table.", why: "CREATE TABLE defines the schema (columns and types) for new data." },
    { q: "Which keyword combines multiple WHERE conditions?", a: "AND / OR (logical operators for complex filters)", options: ["AND / OR (logical operators for complex filters)", "PLUS / MINUS (arithmetic operators for calculations)", "JOIN / LINK (relational operators for connecting tables)", "BOTH / EITHER (non-standard keywords for logic)"], hint: "Logic in filters.", why: "Just like in programming, AND/OR combine boolean logic in SQL." },
    { q: "Write a query to find students with over 90 marks.", a: "SELECT * FROM Students WHERE marks > 90", options: ["SELECT * FROM Students WHERE marks > 90", "FIND Students WHERE marks ARE GREATER THAN 90", "SELECT marks FROM Students IF marks > 90", "SEARCH Students FOR marks > 90"], hint: "SELECT, FROM, WHERE.", why: "This follows the standard SQL syntax for a filtered search." },
    { q: "Which SQL keyword chooses which fields to show?", a: "SELECT", options: ["SELECT", "FROM", "WHERE", "ORDER BY"], hint: "Pick the columns.", why: "SELECT lists the fields the query should return." },
    { q: "Which SQL keyword names the table to read from?", a: "FROM", options: ["FROM", "SELECT", "WHERE", "INSERT"], hint: "Where the data lives.", why: "FROM identifies the source table." },
    { q: "Which SQL keyword filters the rows returned?", a: "WHERE", options: ["WHERE", "SELECT", "FROM", "ORDER BY"], hint: "Set a condition.", why: "Only rows meeting the condition are included." },
    { q: "What does SELECT * mean?", a: "Return every field in the table", options: ["Return every field in the table", "Return only the first field", "Multiply the values together", "Delete all the fields"], hint: "The wildcard.", why: "The asterisk stands for all columns." },
    { q: "Which clause sorts the results?", a: "ORDER BY", options: ["ORDER BY", "GROUP BY", "WHERE", "SELECT"], hint: "Put them in order.", why: "ASC and DESC control the direction of the sort." },
    { q: "What does DESC do in an ORDER BY clause?", a: "Sorts from highest to lowest", options: ["Sorts from highest to lowest", "Sorts from lowest to highest", "Describes the table structure", "Deletes the sorted rows"], hint: "Descending.", why: "ASC is the default, so DESC must be stated explicitly." },
    { q: "Which SQL statement adds a new record?", a: "INSERT INTO", options: ["INSERT INTO", "SELECT", "UPDATE", "DELETE"], hint: "Put data in.", why: "INSERT INTO names the table and supplies the values." },
    { q: "Which SQL statement changes existing data?", a: "UPDATE", options: ["UPDATE", "INSERT INTO", "SELECT", "CREATE"], hint: "Change what is there.", why: "UPDATE is normally paired with WHERE to target specific rows." },
    { q: "Why is UPDATE without WHERE dangerous?", a: "Every record in the table is changed", options: ["Every record in the table is changed", "The table is deleted entirely", "The query is rejected as invalid", "Only the first record changes"], hint: "No filter, no limits.", why: "A missing WHERE clause is a classic and costly mistake." },
    { q: "Which SQL keyword combines two conditions that must both hold?", a: "AND", options: ["AND", "OR", "NOT", "BETWEEN"], hint: "Both must be true.", why: "OR would return rows meeting either condition." },
    { q: "What does the LIKE operator do?", a: "Matches a pattern within text", options: ["Matches a pattern within text", "Sorts results alphabetically", "Joins two tables", "Counts the rows returned"], hint: "Partial matching.", why: "LIKE 'S%' finds every entry beginning with S." },
    { q: "How would you find pupils aged over 15?", a: "WHERE age > 15", options: ["WHERE age > 15", "WHERE age >= 15", "SELECT age > 15", "ORDER BY age > 15"], hint: "Strictly greater.", why: "Using >= would also include pupils aged exactly 15." },
    { q: "Which clause would you use to select from two linked tables?", a: "A join condition matching the keys", options: ["A join condition matching the keys", "ORDER BY on both tables", "DELETE FROM both tables", "INSERT INTO both tables"], hint: "Match the keys.", why: "Linking the foreign key to the primary key combines the rows." },
    { q: "What does DELETE FROM do?", a: "Removes records from a table", options: ["Removes records from a table", "Removes a field from a table", "Deletes the whole database", "Removes duplicate values only"], hint: "Take rows out.", why: "Like UPDATE, it should almost always include a WHERE clause." },
    { q: "Which query lists surnames in alphabetical order?", a: "SELECT surname FROM pupils ORDER BY surname ASC", options: ["SELECT surname FROM pupils ORDER BY surname ASC", "SELECT surname FROM pupils WHERE surname ASC", "ORDER BY surname FROM pupils", "SELECT ORDER BY surname"], hint: "Select, from, then order.", why: "Clauses must appear in the correct order to be valid." }
  ],
  "3.8 Ethical & Legal": [
    { q: "What is the 'Computer Misuse Act' concerned with?", a: "Unauthorised access to computer systems and data", options: ["Unauthorised access to computer systems and data", "The protection of personal data held by organisations", "The recycling and disposal of old hardware components", "The health and safety of employees using computers"], hint: "Hacking and viruses.", why: "This law makes hacking and creating malware illegal in the UK." },
    { q: "What is the 'Data Protection Act' concerned with?", a: "How organisations collect and use personal information", options: ["How organisations collect and use personal information", "The prevention of unauthorised access by computer hackers", "The intellectual property rights of software developers", "The environmental impact of manufacturing new hardware"], hint: "Personal data rights.", why: "This law ensures personal data is handled fairly and securely." },
    { q: "What is the 'Copyright, Designs and Patents Act'?", a: "Protecting the intellectual property of creators", options: ["Protecting the intellectual property of creators", "Protecting the privacy of individuals on the internet", "Protecting the environment from electronic waste", "Protecting the government from cyber security threats"], hint: "Illegal copying.", why: "This law makes it illegal to copy software or music without permission." },
    { q: "Which law requires data to be kept accurate and up-to-date?", a: "The Data Protection Act (GDPR principles)", options: ["The Data Protection Act (GDPR principles)", "The Computer Misuse Act (anti-hacking rules)", "The Freedom of Information Act (public access rules)", "The Health and Safety at Work Act (office rules)"], hint: "Keeping info correct.", why: "Organisations must ensure the data they hold on you is not wrong." },
    { q: "What is the 'Freedom of Information Act'?", a: "Allowing the public to request data from authorities", options: ["Allowing the public to request data from authorities", "Allowing users to download any software for free online", "Allowing hackers to access systems for testing purposes", "Allowing companies to sell user data to third parties"], hint: "Public data access.", why: "This act allows citizens to see data held by public bodies like the NHS." },
    { q: "What is 'Electronic Waste' (e-waste)?", a: "Discarded electrical or electronic devices and parts", options: ["Discarded electrical or electronic devices and parts", "The unwanted emails and spam received by a user", "The binary data that is no longer needed by a programme", "The heat generated by a processor during a complex task"], hint: "Broken hardware disposal.", why: "E-waste is a major environmental issue due to toxic chemicals in components." },
    { q: "What is the 'Digital Divide'?", a: "The gap between those with and without internet access", options: ["The gap between those with and without internet access", "The difference between binary and hexadecimal numbers", "The physical distance between two networked computers", "The split between the hardware and software departments"], hint: "Access to technology.", why: "Wealth and location can determine who has access to life-changing tech." },
    { q: "What is an 'Ethical' issue in computer science?", a: "A question of what is right or wrong, beyond the law", options: ["A question of what is right or wrong, beyond the law", "A technical problem that causes the system to crash", "A legal requirement to pay for the software you use", "A physical fault in the wiring of the local network"], hint: "Moral choices.", why: "Ethics involve the moral impact of technology on society." },
    { q: "What is a 'Legal' issue in computer science?", a: "An action that breaks a specific law or regulation", options: ["An action that breaks a specific law or regulation", "An action that is considered rude by other internet users", "An action that makes the computer run slower than usual", "An action that involves using an outdated operating system"], hint: "Breaking the law.", why: "Legal issues lead to fines or imprisonment if laws are broken." },
    { q: "What are the environmental impacts of data centres?", a: "High electricity consumption and the need for cooling", options: ["High electricity consumption and the need for cooling", "The production of large amounts of unwanted paper waste", "The noise pollution caused by the spinning hard drives", "The physical space taken up by the network cables"], hint: "Energy and heat.", why: "Servers run 24/7 and generate massive heat, requiring huge power." },
    { q: "What is 'Proprietary Software'?", a: "Software where the source code is kept secret", options: ["Software where the source code is kept secret", "Software that is free to download and edit by anyone", "Software that is used only by the government and police", "Software that has been designed for embedded systems"], hint: "Closed source.", why: "Companies like Microsoft own the code and you cannot see or change it." },
    { q: "What is 'Open Source Software'?", a: "Software where the source code is freely available", options: ["Software where the source code is freely available", "Software that requires a monthly subscription fee", "Software that only runs on high-end gaming computers", "Software that is used to create secret encrypted files"], hint: "Free to edit.", why: "Open source (like Linux) allows anyone to inspect and improve the code." },
    { q: "What is 'Stalking' or 'Harassment' online called?", a: "Cyberbullying (using technology to upset others)", options: ["Cyberbullying (using technology to upset others)", "Phishing (using technology to steal from others)", "Hacking (using technology to access other systems)", "Farming (using technology to redirect other users)"], hint: "Online abuse.", why: "Technology can be misused to target and hurt individuals." },
    { q: "Why is 'Privacy' a concern with smartphones?", a: "They track your location and collect personal data", options: ["They track your location and collect personal data", "They are too small to have a complex security password", "They use a lot of battery power to stay connected", "They are easily broken if they are dropped on the floor"], hint: "Always-on tracking.", why: "Smartphones collect vast amounts of data that can be sold or stolen." },
    { q: "What is the impact of automation on jobs?", a: "Some roles are replaced by robots and software", options: ["Some roles are replaced by robots and software", "Every person is required to work more hours per day", "The cost of living increases due to expensive hardware", "The internet becomes slower due to automated traffic"], hint: "Robots taking jobs.", why: "Automation can lead to job losses in manufacturing and administration." },
    { q: "What does the Data Protection Act require of organisations?", a: "To handle personal data lawfully, fairly and securely", options: ["To handle personal data lawfully, fairly and securely", "To publish all their data online", "To keep every record forever", "To encrypt all their websites"], hint: "Protecting individuals.", why: "It gives people rights over data held about them." },
    { q: "What does the Computer Misuse Act make illegal?", a: "Unauthorised access to computer material", options: ["Unauthorised access to computer material", "Selling second-hand computers", "Writing programs for profit", "Using open-source software"], hint: "Hacking law.", why: "It also covers unauthorised modification of data." },
    { q: "What does copyright protect?", a: "The creator's rights over their original work", options: ["The creator's rights over their original work", "The speed of a computer program", "The security of a network", "The accuracy of stored data"], hint: "Original creations.", why: "Software, music and text are all covered." },
    { q: "What is open-source software?", a: "Software whose source code is available to view and modify", options: ["Software whose source code is available to view and modify", "Software that is always free of bugs", "Software that cannot be copied", "Software that runs only online"], hint: "Open code.", why: "Users may adapt it, usually under licence conditions." },
    { q: "What is proprietary software?", a: "Software whose source code is kept private by its owner", options: ["Software whose source code is kept private by its owner", "Software written by volunteers", "Software with no licence", "Software that is always free"], hint: "Closed source.", why: "Users buy a licence to use it but cannot alter it." },
    { q: "What is an environmental impact of computing?", a: "Electronic waste from discarded devices", options: ["Electronic waste from discarded devices", "Increased rainfall in cities", "Reduced need for electricity", "Fewer materials being mined"], hint: "E-waste.", why: "Devices contain toxic materials that are hard to dispose of safely." },
    { q: "What is the 'digital divide'?", a: "The gap between those with and without access to technology", options: ["The gap between those with and without access to technology", "The split between hardware and software", "The difference between two operating systems", "The boundary between two networks"], hint: "Unequal access.", why: "Lack of access limits education and job opportunities." },
    { q: "Why is data minimisation an important principle?", a: "Only data that is actually needed should be collected", options: ["Only data that is actually needed should be collected", "All available data should be collected", "Data should be deleted every day", "Data should be shared widely"], hint: "Collect only what you need.", why: "Data never collected cannot be leaked or misused." },
    { q: "What is an ethical concern about facial recognition?", a: "People may be identified without their consent", options: ["People may be identified without their consent", "It uses too much electricity", "It requires a fast internet connection", "It only works in daylight"], hint: "Consent and privacy.", why: "Surveillance can occur without individuals knowing." },
    { q: "What is a privacy concern with social media?", a: "Personal data may be shared more widely than intended", options: ["Personal data may be shared more widely than intended", "Posts cannot be deleted by anyone", "Accounts require no password", "Photographs cannot be uploaded"], hint: "Who can see it.", why: "Default settings often share more than users realise." },
    { q: "How can computing benefit the environment?", a: "By enabling remote working and reducing travel", options: ["By enabling remote working and reducing travel", "By increasing the demand for paper", "By requiring more office buildings", "By using more raw materials"], hint: "Fewer journeys.", why: "Video meetings can replace journeys that would produce emissions." },
    { q: "What is a cultural impact of widespread internet access?", a: "People can access information and communities globally", options: ["People can access information and communities globally", "People stop using computers", "Languages disappear immediately", "Postal services become faster"], hint: "Global connection.", why: "It broadens access but can also spread misinformation." },
    { q: "Why must an organisation keep personal data accurate?", a: "Inaccurate data can lead to unfair decisions about people", options: ["Inaccurate data can lead to unfair decisions about people", "Accurate data uses less storage", "Inaccurate data cannot be encrypted", "Accuracy makes queries run faster"], hint: "Real consequences.", why: "A wrong credit record could wrongly deny someone a loan." },
    { q: "What right does an individual usually have over their own data?", a: "To request a copy of the data held about them", options: ["To request a copy of the data held about them", "To demand payment for it automatically", "To edit any company's database directly", "To delete other people's records"], hint: "Subject access.", why: "Data protection law gives individuals rights of access and correction." },
    { q: "Why is automation an ethical issue as well as a technical one?", a: "It can remove jobs that people depend on", options: ["It can remove jobs that people depend on", "It always makes products more expensive", "It requires no electricity", "It cannot be used in factories"], hint: "Impact on workers.", why: "Efficiency gains must be weighed against social consequences." }
  ],
};



// 2. Helper Functions
function createHomeworkCard(title, dateStr, task) {
  return `
    <div class="homework-card" style="border-left: 6px solid var(--dark-purple);">
      <div class="homework-info">
        <h4>${title}</h4>
        <p><strong>Due:</strong> ${dateStr}</p>
        <p>${task}</p>
      </div>
    </div>
  `;
}

// Midnight UTC today, used as the cutoff for "still upcoming".
function todayUTC() {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

// "2026-03-20" -> midnight UTC on that day.
function isoToUTC(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

// "2026-03-20" -> "Fri 20 Mar 2026"
function formatDueDate(iso) {
  return new Date(isoToUTC(iso)).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
  });
}

function getUpcomingHomeworkHTML() {
  const cutoff = todayUTC();

  const upcoming = homeworkBank
    .filter(hw => isoToUTC(hw.date) >= cutoff)
    .sort((a, b) => isoToUTC(a.date) - isoToUTC(b.date))
    .slice(0, 3);

  if (upcoming.length === 0) {
    // The scheme of work has run out. Rather than leaving a dead panel, point
    // the student at the activities that are always available.
    return `
      <div class="card" style="border-left: 5px solid var(--accent-green);">
        <h3 style="margin-top: 0;">No homework set</h3>
        <p>You're all caught up. Keep your recall sharp with a few minutes of practice:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
          <a href="#quiz_trainer" class="dash-action">Quiz Trainer</a>
          <a href="#p1_revision" class="dash-action">Paper 1 Flashcards</a>
          <a href="#p2_revision" class="dash-action">Paper 2 Flashcards</a>
          <a href="#binary_boss" class="dash-action">Binary Boss Battle</a>
        </div>
      </div>`;
  }

  return upcoming.map(hw => createHomeworkCard(hw.title, formatDueDate(hw.date), hw.task)).join('');
}

function createExamCard(title, dateStr, focusStr, examDateObj) {
  const cutoff = todayUTC();
  const examUTC = Date.UTC(examDateObj.getUTCFullYear(), examDateObj.getUTCMonth(), examDateObj.getUTCDate());
  const diffDays = Math.ceil((examUTC - cutoff) / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.ceil(diffDays / 7);

  let countdownHTML = '';
  if (diffDays <= 0) {
    countdownHTML = `
      <div style="background: var(--accent-green-strong); color: white; padding: 10px 20px; border-radius: 8px; text-align: center;">
        <span style="font-size: 1.5rem; font-weight: bold;">Exam Completed</span>
      </div>
     `;
  } else {
    // School weeks logic subtracting the Easter break.
    // UPDATE ME EACH ACADEMIC YEAR, alongside EXAM_SCHEDULE further down: this
    // is the date the school returns after the Easter holiday (month is
    // 0-indexed, so 3 is April).
    // 2027: Easter Sunday falls on 28 March, so this assumes a two-week break
    // returning Monday 12 April. Check it against the school calendar.
    let holidayWeeks = 0;
    const easterEndUTC = Date.UTC(2027, 3, 12);
    if (cutoff < easterEndUTC) holidayWeeks += 2;

    const schoolWeeks = Math.max(0, diffWeeks - holidayWeeks);

    countdownHTML = `
      <div style="background: var(--accent-red-strong); color: white; padding: 10px 20px; border-radius: 8px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <span style="font-size: 1.5rem; font-weight: bold;">${diffDays} Days Left</span><br>
        <span style="font-size: 1rem; font-weight: bold;">${schoolWeeks} School Weeks Left</span><br>
        <span style="font-size: 0.75rem; opacity: 0.9;">(${diffWeeks} Total Weeks)</span>
      </div>
    `;
  }

  return `
    <div class="card" style="border-left: 5px solid var(--exam-red); margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
        <div>
          <h3 style="margin: 0; color: var(--dark-purple);">${title}</h3>
          <p style="margin: 10px 0; font-weight: bold; color: var(--exam-red); font-size: 1.2rem;">Exam Date: ${dateStr}</p>
          <p style="margin: 5px 0;"><strong>Focus:</strong> ${focusStr}</p>
          <p style="font-style: italic; font-size: 0.9rem; color: var(--text-light);">Countdown automatically excludes the Easter break.</p>
        </div>
        ${countdownHTML}
      </div>
    </div>
  `;
}

const contentData = {
  home: `
    <h1>Student Dashboard</h1>
    <p>Welcome back! Here is your current progress and upcoming deadlines.</p>

    <div id="countdown-hero"></div>
    <div id="streak-strip"></div>

    <!-- Collapsed by default: the full list is reference material, not something
         a student needs in front of them every time they open the dashboard. -->
    <details class="card spec-removed spec-disclosure">
      <summary class="spec-summary">
        <span class="spec-badge">Specification update</span>
        <h2 class="spec-summary-title">What's changed for 2027</h2>
        <svg class="spec-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
          aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div class="spec-disclosure-body">
      <h3 style="margin-top: 0;">AQA has cut content from the course</h3>
      <p>Your exams use the updated AQA 8525 specification, first examined in <strong>summer 2027</strong>. AQA only <strong>removed</strong> content &mdash; nothing new was added, and the two papers work exactly as before.</p>
      <p style="margin-bottom: 6px;"><strong>You will no longer be examined on:</strong></p>
      <ul style="margin-top: 0;">
        <li>the <strong>Von Neumann architecture</strong> by name (3.4)</li>
        <li><strong>optical storage</strong> &mdash; CDs, DVDs and Blu-ray (3.4)</li>
        <li><strong>LAN topologies</strong> &mdash; star and bus (3.5)</li>
        <li><strong>Ethernet, Wi&#8209;Fi, UDP and FTP</strong> as named protocols (3.5)</li>
        <li>explaining <strong>the purpose and use</strong> of each protocol (3.5)</li>
      </ul>
      <p style="margin-bottom: 6px;"><strong>Still examined, so keep revising it:</strong></p>
      <ul style="margin-top: 0;">
        <li>the <strong>fetch&ndash;decode&ndash;execute cycle</strong> and the CPU components (ALU, control unit, clock, register, bus)</li>
        <li><strong>solid state, magnetic and cloud</strong> storage</li>
        <li>the <strong>4&#8209;layer TCP/IP model</strong>, and TCP, IP, HTTP, HTTPS, SMTP and IMAP</li>
        <li>LAN/WAN/PAN, wired vs wireless, and network security</li>
      </ul>
      <span class="spec-removed-why">Removed material is still on this site so you can use it as background, but it is marked like this and left out of quizzes, mocks and connecting walls so your scores reflect the real exam.</span>
      </div>
    </details>
    
    <div class="card-grid">
      <div class="card" onclick="loadContent('p1_hub')" style="cursor: pointer; border-top: 5px solid var(--dark-purple);">
        <div class="card-image">&lt;/&gt;</div>
        <div class="card-info">
          <h3>Paper 1: Computational Thinking</h3>
          <p>Fundamentals of Algorithms & Programming. 50% Weighting.</p>
        </div>
      </div>

      <div class="card" onclick="loadContent('p2_hub')" style="cursor: pointer; border-top: 5px solid var(--dark-purple);">
        <div class="card-image">CPU</div>
        <div class="card-info">
          <h3>Paper 2: Computing Concepts</h3>
          <p>Data, Systems, Networks, Cyber Security, Databases & Impacts. 50% Weighting.</p>
        </div>
      </div>
    </div>

    <h2 style="margin-top: 40px; color: var(--accent-red-text);">Final GCSE Exam Dates</h2>
    <div id="exam-cards-container"></div>


    <h2 style="margin-top: 40px;">Year 11 Homework Reminders</h2>
    <div id="homework-reminders-container" style="display: flex; flex-direction: column; gap: 10px;"></div>

    <h2>Revision Hub</h2>
    <div class="card-grid">
      <div class="card" onclick="loadContent('resources')" style="cursor: pointer; border-top: 5px solid #007BFF;">
        <div class="card-image" style="background: #007BFF;">REV</div>
        <div class="card-info">
          <h3>Revision Resources</h3>
          <p>Access all activities, external trainers, and revision sites in one place.</p>
        </div>
      </div>
    </div>
  `,

  connecting_walls: `
    <div id="wall-selection-menu" class="fade-in">
        <h1 style="margin-bottom: 5px;">Select a Connecting Wall</h1>
        <p style="opacity: 0.8; margin-bottom: 30px;">Find groups of 4 connected items.</p>
        
        <h2 class="section-title">Paper 1 Topics</h2>
        <div class="card-grid">
            <div class="wall-topic-card p1" onclick="startConnectingWall('3.1')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                <h3>3.1 Algorithms</h3>
            </div>
            <div class="wall-topic-card p1" onclick="startConnectingWall('3.2')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                <h3>3.2 Programming</h3>
            </div>
            <div class="wall-topic-card p1" onclick="startConnectingWall('3.4')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                <h3>3.4 Systems</h3>
            </div>
        </div>
        
        <h2 class="section-title" style="margin-top: 35px;">Paper 2 Topics</h2>
        <div class="card-grid">
            <div class="wall-topic-card p2" onclick="startConnectingWall('3.3')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                <h3>3.3 Data Rep</h3>
            </div>
            <div class="wall-topic-card p2" onclick="startConnectingWall('3.5')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                <h3>3.5 Networks</h3>
            </div>
            <div class="wall-topic-card p2" onclick="startConnectingWall('3.6')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                <h3>3.6 Cyber Security</h3>
            </div>
            <div class="wall-topic-card p2" onclick="startConnectingWall('3.7')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                <h3>3.7 Databases</h3>
            </div>
            <div class="wall-topic-card p2" onclick="startConnectingWall('3.8')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                <h3>3.8 Ethical</h3>
            </div>
        </div>
        
        <h2 class="section-title" style="margin-top: 35px;">Full Paper Mixes</h2>
        <div class="card-grid">
            <div class="wall-topic-card mix" onclick="startConnectingWall('PAPER_1')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"></path><path d="M4 20L21 3"></path><path d="M21 16v5h-5"></path><path d="M15 15l6 6"></path><path d="M4 4l5 5"></path></svg>
                <h3>Paper 1 Mix</h3>
            </div>
            <div class="wall-topic-card mix" onclick="startConnectingWall('PAPER_2')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"></path><path d="M4 20L21 3"></path><path d="M21 16v5h-5"></path><path d="M15 15l6 6"></path><path d="M4 4l5 5"></path></svg>
                <h3>Paper 2 Mix</h3>
            </div>
        </div>
    </div>

    <div id="wall-area" style="display: none;" class="fade-in">
        <h2 id="wall-topic-display" style="color: var(--text); margin-bottom: 20px;"></h2>
        <div id="wall-grid" class="wall-grid"></div>
        <div id="wall-feedback" class="wall-feedback" style="color: var(--text);"></div>
        <div id="wall-solved-categories"></div>
        <div style="margin-top: 30px;">
            <div class="wall-topic-card" onclick="showWallMenu()" style="display: inline-flex; border-left-color: var(--accent-red-text);">
                <h3 style="margin: 0;">← Back to Selection</h3>
            </div>
        </div>
    </div>
  `,

  // --- PAPER 1 HUB ---
  p1_hub: `
    <h1>Paper 1: Computational Thinking and Programming Skills</h1>
    <p>This exam tests your ability to write code and understand algorithms. It focuses purely on problem-solving logic.</p>

    <h2 class="section-title">Topic Areas</h2>
    <div class="card-grid">
      <div class="card" onclick="loadContent('p1_algo')" style="cursor: pointer;">
        <div class="card-image">3.1</div>
        <div class="card-info">
          <h3>3.1 Fundamentals of algorithms</h3>
          <p>Flowcharts, Pseudocode, Searching (Binary/Linear) & Sorting (Bubble/Merge).</p>
        </div>
      </div>
      <div class="card" onclick="loadContent('p1_prog')" style="cursor: pointer;">
        <div class="card-image">3.2</div>
        <div class="card-info">
          <h3>3.2 Programming</h3>
          <p>Variables, Selection (If), Iteration (Loops), Arrays, and Subroutines.</p>
        </div>
      </div>
      <div class="card" onclick="loadContent('prac_hub')" style="cursor: pointer; border-left: 5px solid var(--accent-green);">
        <h3>Practical Programming (Python Basics)</h3>
        <p>Apply your Paper 1 knowledge with Python coding challenges, syntax guides, and debugging practice.</p>
      </div>
    </div>

    <h2 class="section-title">Activities</h2>
    <div class="card-grid">
      <div class="card" onclick="loadContent('p1_revision')" style="cursor: pointer; border-left: 5px solid #FFC107;">
        <div class="card-image" style="background: #FFC107; color: #333;">Revise</div>
        <div class="card-info">
          <h3>Key Term Revision Cards</h3>
          <p>Test your knowledge of key definitions for Paper 1. Click to flip, swipe to skip.</p>
        </div>
      </div>

      <div class="card" onclick="window.open('https://mrowoyemi.github.io/GCSE-COMP-SCI-TRAINER/', '_blank')" style="cursor: pointer; border-left: 5px solid #007BFF;">
        <div class="card-image" style="background: #007BFF; color: white;">Quiz</div>
        <div class="card-info">
          <h3>Mini Quiz Trainer</h3>
          <p>Launch the external quiz trainer to test your knowledge with rapid-fire questions.</p>
        </div>
      </div>
    </div>
    
  `,

  // --- NEW: REVISION CARDS ACTIVITY (UPDATED SIZE) ---
  p1_revision: `
    <h1 style="text-align: center; font-size: 2.5rem; margin-bottom: 10px;">Paper 1 Revision Cards</h1>
    <p style="text-align: center; font-size: 1.2rem; color: var(--text-light);">Click the card to reveal the definition. Click 'Next' to move to the next term.</p>

    <div class="flashcard-container" style="margin: 40px auto; width: 90%; max-width: 800px; cursor: pointer;" onclick="flipCard()">
      <div id="flashcard" style="position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; box-shadow: 0 15px 30px rgba(0,0,0,0.15);">
        
        <div style="position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; background-color: var(--brand-surface); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 20px;">
          <h2 id="card-term" style="margin: 0; padding: 20px; font-size: 3.5rem; color: white;">Algorithm</h2>
          <p style="margin-top: 15px; font-size: 1.2rem; color: #e2e8f0; font-style: italic;">(Click to flip)</p>
        </div>

        <div style="position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; background-color: var(--card-bg); color: var(--text); transform: rotateY(180deg); display: flex; align-items: center; justify-content: center; border-radius: 20px; border: 4px solid var(--dark-purple);">
          <p id="card-def" style="padding: 40px; font-size: 1.8rem; line-height: 1.6; font-weight: 500;">A set of step-by-step instructions to solve a problem.</p>
        </div>

      </div>
    </div>

    <div class="flashcard-controls" style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 30px;">
      <button onclick="prevCard()" style="padding: 15px 30px; font-size: 1.1rem; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Previous</button>
      
      <span id="card-counter" style="font-weight: bold; font-size: 1.5rem;">1 / 20</span>
      <span id="card-removed-flag" class="spec-badge" style="display:none; margin-left:12px;">Not examined from 2027</span>
      <button onclick="nextCard()" style="padding: 15px 30px; font-size: 1.1rem; background: var(--brand-surface); color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Next Card</button>
    </div>
      <div class="card-rating">
        <span class="card-rating-label">How well did you know it?</span>
        <div class="card-rating-btns">
          <button class="rate-btn rate-again" onclick="rateCurrentCard('again')">Again</button>
          <button class="rate-btn rate-hard" onclick="rateCurrentCard('hard')">Hard</button>
          <button class="rate-btn rate-got" onclick="rateCurrentCard('got')">Got it</button>
        </div>
      </div>
      <div id="deck-summary" class="deck-summary"></div>


    <div style="text-align: center; margin-top: 40px;">
      <button onclick="goBack()" style="padding: 10px 25px; background: transparent; color: var(--dark-purple); border: 2px solid var(--dark-purple); border-radius: 5px; cursor: pointer; font-weight: bold;">Back to Menu</button>
    </div>
  `,

  // --- PAPER 2 HUB (Updated with Activities) ---
  p2_hub: `
    <h1>Paper 2: Computing Concepts</h1>
    <p>This exam covers the theory of how computers store data, how they work physically, how they connect, and the legal issues surrounding them.</p>

    <h2 class="section-title">Topic Areas</h2>
    <div class="card-grid">
      <div class="card" onclick="loadContent('p2_data')" style="cursor: pointer;">
        <div class="card-image">3.3</div>
        <div class="card-info">
          <h3>3.3 Data representation</h3>
          <p>Binary, Hexadecimal, Image/Sound representation, and Compression.</p>
        </div>
      </div>
      <div class="card" onclick="loadContent('p2_sys')" style="cursor: pointer;">
        <div class="card-image">3.4</div>
        <div class="card-info">
          <h3>3.4 Computer systems</h3>
          <p>Hardware, CPU Architecture, Memory (RAM/ROM), and Storage.</p>
        </div>
      </div>
      <div class="card" onclick="loadContent('p2_net')" style="cursor: pointer;">
        <div class="card-image">3.5</div>
        <div class="card-info">
          <h3>3.5 Computer networks</h3>
          <p>LAN/WAN, Topologies, Protocols (TCP/IP), and Security.</p>
        </div>
      </div>
      <div class="card" onclick="loadContent('p2_cyber')" style="cursor: pointer;">
        <div class="card-image">3.6</div>
        <div class="card-info">
          <h3>3.6 Cyber security</h3>
          <p>Threats (Phishing, Malware) and Prevention methods.</p>
        </div>
      </div>
      <div class="card" onclick="loadContent('p2_sql')" style="cursor: pointer;">
        <div class="card-image">3.7</div>
        <div class="card-info">
          <h3>3.7 Databases (SQL)</h3>
          <p>Relational databases and Structured Query Language.</p>
        </div>
      </div>
      <div class="card" onclick="loadContent('p2_impact')" style="cursor: pointer;">
        <div class="card-image">3.8</div>
        <div class="card-info">
          <h3>3.8 Impacts of Tech</h3>
          <p>Ethical, Legal, and Environmental impacts on society.</p>
        </div>
      </div>
    </div>

    <h2 class="section-title">Activities</h2>
    <div class="card-grid">
      <div class="card" onclick="loadContent('p2_revision')" style="cursor: pointer; border-left: 5px solid #FFC107;">
        <div class="card-image" style="background: #FFC107; color: #333;">Revise</div>
        <div class="card-info">
          <h3>Key Term Revision Cards</h3>
          <p>Test your knowledge of key definitions for Paper 2. Click to flip, swipe to skip.</p>
        </div>
      </div>

      <div class="card" onclick="window.open('https://mrowoyemi.github.io/GCSE-COMP-SCI-TRAINER/', '_blank')" style="cursor: pointer; border-left: 5px solid #007BFF;">
        <div class="card-image" style="background: #007BFF; color: white;">Quiz</div>
        <div class="card-info">
          <h3>Mini Quiz Trainer</h3>
          <p>Launch the external quiz trainer to test your knowledge with rapid-fire questions.</p>
        </div>
      </div>
    </div>

  `,

  p2_revision: `
  <h1 style="text-align: center; font-size: 2.5rem; color: var(--dark-purple); margin-bottom: 10px;">Paper 2 Revision Cards</h1>
  <p style="text-align: center; font-size: 1.1rem; color: var(--text-light);">Click the card to reveal the definition. Click 'Next' to move to the next term.</p>

  <div class="flashcard-container" style="margin: 40px auto; width: 90%; max-width: 800px; cursor: pointer;" onclick="flipCard()">
    <div id="flashcard" style="position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; box-shadow: 0 15px 30px rgba(0,0,0,0.15); border-radius: 20px;">
      
      <div style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background-color: var(--brand-surface); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 20px;">
        <h2 id="card-term" style="margin: 0; padding: 20px; font-size: 3.5rem; color: white;">Term Loading...</h2>
        <p style="margin-top: 15px; font-size: 1.2rem; color: #e2e8f0; font-style: italic;">(Click to flip)</p>
      </div>

      <div style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background-color: var(--card-bg); color: var(--text); transform: rotateY(180deg); display: flex; align-items: center; justify-content: center; border-radius: 20px; border: 4px solid var(--dark-purple);">
        <p id="card-def" style="padding: 40px; font-size: 1.8rem; line-height: 1.6; font-weight: 500;">Definition Loading...</p>
      </div>
    </div>
  </div>

  <div class="flashcard-controls" style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 30px;">
    <button onclick="prevCard()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Previous</button>
    
      <span id="card-counter" style="font-weight: bold; font-size: 1.5rem; color: var(--dark-purple);">1 / 32</span>
      <span id="card-removed-flag" class="spec-badge" style="display:none; margin-left:12px;">Not examined from 2027</span>
    <button onclick="nextCard()" style="padding: 10px 20px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Next Card</button>
  </div>
      <div class="card-rating">
        <span class="card-rating-label">How well did you know it?</span>
        <div class="card-rating-btns">
          <button class="rate-btn rate-again" onclick="rateCurrentCard('again')">Again</button>
          <button class="rate-btn rate-hard" onclick="rateCurrentCard('hard')">Hard</button>
          <button class="rate-btn rate-got" onclick="rateCurrentCard('got')">Got it</button>
        </div>
      </div>
      <div id="deck-summary" class="deck-summary"></div>


  <div style="text-align: center; margin-top: 25px;">
    <button onclick="goBack()" style="padding: 10px 20px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Back to Hub</button>
  </div>
`,

  // --- PRACTICAL HUB ---
  prac_hub: `
    <h1>Practical Programming (Python)</h1>
    <p>While there is no coursework, you must be able to read, write, and trace code in the exam.</p>

    <div class="card-grid">
      <div class="card" onclick="loadContent('prac_core_constructs')" style="cursor: pointer; border-left: 5px solid var(--accent-green);">
        <h3>Core Constructs</h3>
        <p>Sequence, Selection (If/Else), and Iteration (While/For loops).</p>
      </div>
      <div class="card" onclick="loadContent('prac_data_structs')" style="cursor: pointer; border-left: 5px solid var(--accent-green);">
        <h3>Data Structures</h3>
        <p>Lists (Arrays), 2D Lists, and Dictionaries.</p>
      </div>
      <div class="card" onclick="loadContent('prac_string_manip')" style="cursor: pointer; border-left: 5px solid var(--accent-green);">
        <h3>String Manipulation</h3>
        <p>Slicing, Casting, and ASCII conversion.</p>
      </div>
      <div class="card" onclick="loadContent('prac_subroutines')" style="cursor: pointer; border-left: 5px solid #17a2b8;">
        <h3>Subroutines</h3>
        <p>Functions, Procedures, Parameters, and Variable Scope.</p>
      </div>
      <div class="card" onclick="loadContent('prac_file_handling')" style="cursor: pointer; border-left: 5px solid #17a2b8;">
        <h3>File Handling</h3>
        <p>Opening, Reading, Writing, and Closing external text files.</p>
      </div>
      <div class="card" onclick="loadContent('prac_validation')" style="cursor: pointer; border-left: 5px solid #ffc107;">
        <h3>Robust Programs</h3>
        <p>Defensive design, Validation checks, and Error Handling.</p>
      </div>
      <div class="card" onclick="loadContent('prac_modules')" style="cursor: pointer; border-left: 5px solid #fd7e14;">
        <h3>Built-in Modules</h3>
        <p>A cheat sheet for using random and maths functions.</p>
      </div>
    </div>

    <h2 class="section-title">Coding Challenges</h2>
    <div class="homework-box">
      <p><strong>Easy:</strong> Write a program that asks for a name and prints it 5 times.</p>
      <p><strong>Medium:</strong> Write a program to calculate the average of numbers in a list.</p>
      <p><strong>Hard:</strong> Implement the Bubble Sort algorithm from scratch.</p>
    </div>
  `,

  // --- PRACTICAL CORE CONSTRUCTS ---
  prac_core_constructs: `
    <h1>Core Constructs in Python</h1>
    <p>Every algorithm is built using three fundamental programming constructs: Sequence, Selection, and Iteration. Here is how they are defined and coded in Python.</p>
    

    <h2 class="section-title">1. Sequence</h2>
    <p><strong>Definition:</strong> Sequence is the execution of statements or instructions one after the other, in the exact order they are written.</p>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># EASY: Basic top-to-bottom execution</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Step 1"</span>)<br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Step 2"</span>)<br><br>

      <span style="color:#6a9955;"># MEDIUM: Taking inputs and processing in order</span><br>
      <span style="color:#569cd6;">num1</span> = <span style="color:#4ec9b0;">int</span>(<span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter a number: "</span>))<br>
      <span style="color:#569cd6;">num2</span> = <span style="color:#4ec9b0;">int</span>(<span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter another: "</span>))<br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Total:"</span>, <span style="color:#569cd6;">num1</span> + <span style="color:#569cd6;">num2</span>)<br><br>

      <span style="color:#6a9955;"># HARD: Sequence with Modulo and Integer Division</span><br>
      <span style="color:#569cd6;">total_sweets</span> = <span style="color:#b5cea8;">25</span><br>
      <span style="color:#569cd6;">students</span> = <span style="color:#b5cea8;">7</span><br>
      <span style="color:#569cd6;">sweets_per_student</span> = <span style="color:#569cd6;">total_sweets</span> // <span style="color:#569cd6;">students</span> <span style="color:#6a9955;"># DIV (Outputs 3)</span><br>
      <span style="color:#569cd6;">left_over</span> = <span style="color:#569cd6;">total_sweets</span> % <span style="color:#569cd6;">students</span> <span style="color:#6a9955;"># MOD (Outputs 4)</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Each gets"</span>, <span style="color:#569cd6;">sweets_per_student</span>, <span style="color:#ce9178;">"with"</span>, <span style="color:#569cd6;">left_over</span>, <span style="color:#ce9178;">"left."</span>)
    </div>

    <h2 class="section-title">2. Selection</h2>
    <p><strong>Definition:</strong> Selection allows a program to make decisions and choose different paths or branches of execution based on a condition evaluating to True or False.</p>

    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># EASY: Simple If/Else</span><br>
      <span style="color:#569cd6;">age</span> = <span style="color:#b5cea8;">15</span><br>
      <span style="color:#c586c0;">if</span> <span style="color:#569cd6;">age</span> >= <span style="color:#b5cea8;">18</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Adult"</span>)<br>
      <span style="color:#c586c0;">else</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Child"</span>)<br><br>

      <span style="color:#6a9955;"># MEDIUM: Multiple conditions using Elif</span><br>
      <span style="color:#569cd6;">score</span> = <span style="color:#b5cea8;">75</span><br>
      <span style="color:#c586c0;">if</span> <span style="color:#569cd6;">score</span> >= <span style="color:#b5cea8;">80</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Distinction"</span>)<br>
      <span style="color:#c586c0;">elif</span> <span style="color:#569cd6;">score</span> >= <span style="color:#b5cea8;">60</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Merit"</span>)<br>
      <span style="color:#c586c0;">else</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Pass"</span>)<br><br>

      <span style="color:#6a9955;"># HARD: Nested Ifs with Logical Operators (AND/OR/NOT)</span><br>
      <span style="color:#569cd6;">day</span> = <span style="color:#ce9178;">"Saturday"</span><br>
      <span style="color:#569cd6;">is_raining</span> = <span style="color:#569cd6;">True</span><br>
      <span style="color:#c586c0;">if</span> <span style="color:#569cd6;">day</span> == <span style="color:#ce9178;">"Saturday"</span> <span style="color:#c586c0;">or</span> <span style="color:#569cd6;">day</span> == <span style="color:#ce9178;">"Sunday"</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c586c0;">if</span> <span style="color:#c586c0;">not</span> <span style="color:#569cd6;">is_raining</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Go to the park!"</span>)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c586c0;">else</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Stay inside and play games."</span>)
    </div>

    <h2 class="section-title">3. Iteration</h2>
    <p><strong>Definition:</strong> Iteration (looping) is the process of repeating a block of code. This can be done a set number of times (Definite) or continuously until a condition changes (Indefinite).</p>

    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># EASY: Definite Iteration (For Loop)</span><br>
      <span style="color:#c586c0;">for</span> i <span style="color:#c586c0;">in</span> <span style="color:#4ec9b0;">range</span>(<span style="color:#b5cea8;">3</span>): <span style="color:#6a9955;"># Loops 0, 1, 2</span><br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Loop iteration:"</span>, i)<br><br>

      <span style="color:#6a9955;"># MEDIUM: Indefinite Iteration (While Loop)</span><br>
      <span style="color:#569cd6;">guess</span> = <span style="color:#ce9178;">""</span><br>
      <span style="color:#c586c0;">while</span> <span style="color:#569cd6;">guess</span> != <span style="color:#ce9178;">"secret"</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">guess</span> = <span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter password: "</span>)<br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Access Granted!"</span>)<br><br>

      <span style="color:#6a9955;"># HARD: While Loop with multiple conditions and counters</span><br>
      <span style="color:#569cd6;">attempts</span> = <span style="color:#b5cea8;">0</span><br>
      <span style="color:#569cd6;">pin</span> = <span style="color:#b5cea8;">0000</span><br>
      <span style="color:#c586c0;">while</span> <span style="color:#569cd6;">pin</span> != <span style="color:#b5cea8;">1234</span> <span style="color:#c586c0;">and</span> <span style="color:#569cd6;">attempts</span> < <span style="color:#b5cea8;">3</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">pin</span> = <span style="color:#4ec9b0;">int</span>(<span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter PIN: "</span>))<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">attempts</span> += <span style="color:#b5cea8;">1</span><br>
      <span style="color:#c586c0;">if</span> <span style="color:#569cd6;">pin</span> == <span style="color:#b5cea8;">1234</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Phone Unlocked"</span>)<br>
      <span style="color:#c586c0;">else</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Device Locked."</span>)
    </div>

  `,

  // --- DATA STRUCTURES ---
  prac_data_structs: `
    <h1>Data Structures</h1>
    <p>Data structures allow us to store a collection of data under a single variable name. The AQA spec requires you to understand 1D Arrays, 2D Arrays, and Records.</p>
    

    <h2 class="section-title">1. 1D Arrays (Lists)</h2>
    <p>An array is a static data structure holding items of the same data type. Python uses "Lists" instead, which are dynamic, but you will treat them like arrays in the exam.</p>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># EASY: Creating and Accessing</span><br>
      <span style="color:#569cd6;">names</span> = [<span style="color:#ce9178;">"Ali"</span>, <span style="color:#ce9178;">"Ben"</span>, <span style="color:#ce9178;">"Cyd"</span>]<br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#569cd6;">names</span>[<span style="color:#b5cea8;">0</span>]) <span style="color:#6a9955;"># Outputs "Ali"</span><br><br>

      <span style="color:#6a9955;"># MEDIUM: Modifying and appending</span><br>
      <span style="color:#569cd6;">names</span>.append(<span style="color:#ce9178;">"Dan"</span>) <span style="color:#6a9955;"># Adds Dan to the end</span><br>
      <span style="color:#569cd6;">names</span>[<span style="color:#b5cea8;">1</span>] = <span style="color:#ce9178;">"Bob"</span> <span style="color:#6a9955;"># Overwrites "Ben" with "Bob"</span><br><br>

      <span style="color:#6a9955;"># HARD: Iterating through an array to search</span><br>
      <span style="color:#569cd6;">scores</span> = [<span style="color:#b5cea8;">45</span>, <span style="color:#b5cea8;">80</span>, <span style="color:#b5cea8;">32</span>, <span style="color:#b5cea8;">99</span>, <span style="color:#b5cea8;">50</span>]<br>
      <span style="color:#569cd6;">highest</span> = <span style="color:#b5cea8;">0</span><br>
      <span style="color:#c586c0;">for</span> i <span style="color:#c586c0;">in</span> <span style="color:#4ec9b0;">range</span>(<span style="color:#4ec9b0;">len</span>(<span style="color:#569cd6;">scores</span>)):<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c586c0;">if</span> <span style="color:#569cd6;">scores</span>[i] > <span style="color:#569cd6;">highest</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">highest</span> = <span style="color:#569cd6;">scores</span>[i]<br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Top score is:"</span>, <span style="color:#569cd6;">highest</span>)
    </div>

    <h2 class="section-title">2. 2D Arrays (2D Lists)</h2>
    <p>A 2D array is a list of lists, often used to represent a table or grid. You access data using two indexes: <code>[row][column]</code>.</p>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># EASY: Creating a grid and accessing a cell</span><br>
      <span style="color:#569cd6;">grid</span> = [ [<span style="color:#b5cea8;">1</span>,<span style="color:#b5cea8;">2</span>,<span style="color:#b5cea8;">3</span>], [<span style="color:#b5cea8;">4</span>,<span style="color:#b5cea8;">5</span>,<span style="color:#b5cea8;">6</span>] ]<br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#569cd6;">grid</span>[<span style="color:#b5cea8;">1</span>][<span style="color:#b5cea8;">0</span>]) <span style="color:#6a9955;"># Row 1, Column 0 (Outputs 4)</span><br><br>

      <span style="color:#6a9955;"># MEDIUM: Modifying a specific cell</span><br>
      <span style="color:#569cd6;">grid</span>[<span style="color:#b5cea8;">0</span>][<span style="color:#b5cea8;">2</span>] = <span style="color:#b5cea8;">99</span> <span style="color:#6a9955;"># Changes the '3' to '99'</span><br><br>

      <span style="color:#6a9955;"># HARD: Nested loops to iterate through a 2D Array</span><br>
      <span style="color:#c586c0;">for</span> row <span style="color:#c586c0;">in</span> <span style="color:#4ec9b0;">range</span>(<span style="color:#b5cea8;">2</span>):<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c586c0;">for</span> col <span style="color:#c586c0;">in</span> <span style="color:#4ec9b0;">range</span>(<span style="color:#b5cea8;">3</span>):<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Processing:"</span>, <span style="color:#569cd6;">grid</span>[row][col])
    </div>

    <h2 class="section-title">3. Records (Dictionaries)</h2>
    <p>A Record stores related items of different data types under one name. In Python, we use <strong>Dictionaries</strong> with <code>key: value</code> pairs.</p>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># EASY: Creating a dictionary and accessing a value</span><br>
      <span style="color:#569cd6;">student</span> = {<span style="color:#ce9178;">"ID"</span>: <span style="color:#b5cea8;">101</span>, <span style="color:#ce9178;">"Name"</span>: <span style="color:#ce9178;">"Alice"</span>, <span style="color:#ce9178;">"Passed"</span>: <span style="color:#569cd6;">True</span>}<br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#569cd6;">student</span>[<span style="color:#ce9178;">"Name"</span>]) <span style="color:#6a9955;"># Outputs "Alice"</span><br><br>

      <span style="color:#6a9955;"># MEDIUM: Adding new keys and modifying existing ones</span><br>
      <span style="color:#569cd6;">student</span>[<span style="color:#ce9178;">"Age"</span>] = <span style="color:#b5cea8;">16</span> <span style="color:#6a9955;"># Adds a new key-value pair</span><br>
      <span style="color:#569cd6;">student</span>[<span style="color:#ce9178;">"Passed"</span>] = <span style="color:#569cd6;">False</span> <span style="color:#6a9955;"># Updates a field</span><br><br>

      <span style="color:#6a9955;"># HARD: Array of Records (List of Dictionaries)</span><br>
      <span style="color:#569cd6;">class_list</span> = [<br>
      &nbsp;&nbsp;&nbsp;&nbsp;{<span style="color:#ce9178;">"Name"</span>: <span style="color:#ce9178;">"Ali"</span>, <span style="color:#ce9178;">"Grade"</span>: <span style="color:#b5cea8;">7</span>},<br>
      &nbsp;&nbsp;&nbsp;&nbsp;{<span style="color:#ce9178;">"Name"</span>: <span style="color:#ce9178;">"Bea"</span>, <span style="color:#ce9178;">"Grade"</span>: <span style="color:#b5cea8;">9</span>}<br>
      ]<br>
      <span style="color:#c586c0;">for</span> i <span style="color:#c586c0;">in</span> <span style="color:#4ec9b0;">range</span>(<span style="color:#4ec9b0;">len</span>(<span style="color:#569cd6;">class_list</span>)):<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#569cd6;">class_list</span>[i][<span style="color:#ce9178;">"Name"</span>], <span style="color:#ce9178;">"got a"</span>, <span style="color:#569cd6;">class_list</span>[i][<span style="color:#ce9178;">"Grade"</span>])
    </div>

  `,

  // --- STRING MANIPULATION ---
  prac_string_manip: `
    <h1>String Manipulation</h1>
    <p>Strings are collections of characters. For the AQA exam, you must be able to calculate length, extract substrings (slicing), concatenate, change case, and cast.</p>
    

    <h2 class="section-title">1. Length, Indexing & Concatenation</h2>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># EASY: Basic concatenation</span><br>
      <span style="color:#569cd6;">word1</span> = <span style="color:#ce9178;">"Super"</span><br>
      <span style="color:#569cd6;">word2</span> = <span style="color:#ce9178;">"man"</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#569cd6;">word1</span> + <span style="color:#569cd6;">word2</span>) <span style="color:#6a9955;"># "Superman"</span><br><br>

      <span style="color:#6a9955;"># MEDIUM: Finding length and indexing</span><br>
      <span style="color:#569cd6;">word</span> = <span style="color:#ce9178;">"Computer"</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#4ec9b0;">len</span>(<span style="color:#569cd6;">word</span>)) <span style="color:#6a9955;"># Length: 8</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#569cd6;">word</span>[<span style="color:#b5cea8;">0</span>]) <span style="color:#6a9955;"># Index 0: "C"</span><br><br>

      <span style="color:#6a9955;"># HARD: Iterating over every character in a string</span><br>
      <span style="color:#569cd6;">vowels</span> = <span style="color:#b5cea8;">0</span><br>
      <span style="color:#c586c0;">for</span> i <span style="color:#c586c0;">in</span> <span style="color:#4ec9b0;">range</span>(<span style="color:#4ec9b0;">len</span>(<span style="color:#569cd6;">word</span>)):<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c586c0;">if</span> <span style="color:#569cd6;">word</span>[i] <span style="color:#c586c0;">in</span> [<span style="color:#ce9178;">"a"</span>, <span style="color:#ce9178;">"e"</span>, <span style="color:#ce9178;">"i"</span>, <span style="color:#ce9178;">"o"</span>, <span style="color:#ce9178;">"u"</span>]:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">vowels</span> += <span style="color:#b5cea8;">1</span>
    </div>

    <h2 class="section-title">2. Substrings (Slicing)</h2>
    <p>You can extract a portion of a string using slicing. The syntax is <code>[start:end]</code>, going <em>up to, but not including</em> the end index.</p>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#569cd6;">word</span> = <span style="color:#ce9178;">"Algorithm"</span><br><br>
      <span style="color:#6a9955;"># EASY: Extract the beginning of a string</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#569cd6;">word</span>[<span style="color:#b5cea8;">0</span>:<span style="color:#b5cea8;">4</span>]) <span style="color:#6a9955;"># Outputs "Algo" (Indexes 0, 1, 2, 3)</span><br><br>

      <span style="color:#6a9955;"># MEDIUM: Extracting from the middle to the end</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#569cd6;">word</span>[<span style="color:#b5cea8;">4</span>:]) <span style="color:#6a9955;"># Outputs "rithm" (Starts at index 4, goes to end)</span><br><br>

      <span style="color:#6a9955;"># HARD: Combining slicing to alter strings</span><br>
      <span style="color:#569cd6;">new_word</span> = <span style="color:#569cd6;">word</span>[<span style="color:#b5cea8;">0</span>:<span style="color:#b5cea8;">4</span>] + <span style="color:#ce9178;">"phobia"</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#569cd6;">new_word</span>) <span style="color:#6a9955;"># Outputs "Algophobia"</span>
    </div>

    <h2 class="section-title">3. Case Conversion & Casting</h2>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># EASY: Case conversion</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"hello"</span>.upper()) <span style="color:#6a9955;"># "HELLO"</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"WORLD"</span>.lower()) <span style="color:#6a9955;"># "world"</span><br><br>

      <span style="color:#6a9955;"># MEDIUM: Casting between string and int</span><br>
      <span style="color:#569cd6;">num_str</span> = <span style="color:#ce9178;">"25"</span><br>
      <span style="color:#569cd6;">math_ready</span> = <span style="color:#4ec9b0;">int</span>(<span style="color:#569cd6;">num_str</span>) + <span style="color:#b5cea8;">5</span> <span style="color:#6a9955;"># Cast to integer, outputs 30</span><br>
      <span style="color:#569cd6;">print_ready</span> = <span style="color:#4ec9b0;">str</span>(<span style="color:#b5cea8;">99</span>) + <span style="color:#ce9178;">" balloons"</span> <span style="color:#6a9955;"># Cast to string to concatenate</span><br><br>

      <span style="color:#6a9955;"># HARD: String extraction and casting combined</span><br>
      <span style="color:#569cd6;">data</span> = <span style="color:#ce9178;">"Age: 16"</span><br>
      <span style="color:#569cd6;">age_num</span> = <span style="color:#4ec9b0;">int</span>(<span style="color:#569cd6;">data</span>[<span style="color:#b5cea8;">5</span>:]) <span style="color:#6a9955;"># Slices out the "16" and casts it</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Next year you are"</span>, <span style="color:#569cd6;">age_num</span> + <span style="color:#b5cea8;">1</span>)
    </div>

    <h2 class="section-title">4. Character Codes (ASCII)</h2>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># EASY: Finding ASCII value of a character</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#4ec9b0;">ord</span>(<span style="color:#ce9178;">"A"</span>)) <span style="color:#6a9955;"># ord() returns 65</span><br><br>

      <span style="color:#6a9955;"># MEDIUM: Finding the character from an ASCII value</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#4ec9b0;">chr</span>(<span style="color:#b5cea8;">66</span>)) <span style="color:#6a9955;"># chr() returns 'B'</span><br><br>

      <span style="color:#6a9955;"># HARD: Basic cipher shifting using ASCII</span><br>
      <span style="color:#569cd6;">letter</span> = <span style="color:#ce9178;">"A"</span><br>
      <span style="color:#569cd6;">ascii_val</span> = <span style="color:#4ec9b0;">ord</span>(<span style="color:#569cd6;">letter</span>)<br>
      <span style="color:#569cd6;">shifted_val</span> = <span style="color:#569cd6;">ascii_val</span> + <span style="color:#b5cea8;">3</span> <span style="color:#6a9955;"># Shift forward by 3 (Caesar Cipher)</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#4ec9b0;">chr</span>(<span style="color:#569cd6;">shifted_val</span>)) <span style="color:#6a9955;"># Outputs 'D'</span>
    </div>

  `,

  // --- SUBROUTINES ---
  prac_subroutines: `
    <h1>Subroutines: Functions & Procedures</h1>
    <p>A subroutine is a named, self-contained block of code that performs a specific task. Using them makes your code modular, easier to read, and prevents you from writing the same code twice.</p>
    

    <h2 class="section-title">1. Procedures vs Functions</h2>
    <p>The AQA specification requires you to know the difference: A <strong>Procedure</strong> just executes a set of instructions. A <strong>Function</strong> executes instructions AND returns a value back to the main program.</p>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># EASY: Procedure (No parameters, no return)</span><br>
      <span style="color:#c586c0;">def</span> <span style="color:#dcdcaa;">greet_user</span>():<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Welcome to the system!"</span>)<br><br>
      <span style="color:#dcdcaa;">greet_user</span>() <span style="color:#6a9955;"># Calling the procedure</span><br><br>

      <span style="color:#6a9955;"># MEDIUM: Procedure with Parameters</span><br>
      <span style="color:#c586c0;">def</span> <span style="color:#dcdcaa;">greet_by_name</span>(<span style="color:#9cdcfe;">name</span>):<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Hello "</span> + <span style="color:#9cdcfe;">name</span>)<br><br>
      <span style="color:#dcdcaa;">greet_by_name</span>(<span style="color:#ce9178;">"Alice"</span>) <span style="color:#6a9955;"># "Alice" is the argument passed in</span><br><br>

      <span style="color:#6a9955;"># HARD: Function (Parameters AND a Return value)</span><br>
      <span style="color:#c586c0;">def</span> <span style="color:#dcdcaa;">calculate_area</span>(<span style="color:#9cdcfe;">width</span>, <span style="color:#9cdcfe;">height</span>):<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">area</span> = <span style="color:#9cdcfe;">width</span> * <span style="color:#9cdcfe;">height</span><br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c586c0;">return</span> <span style="color:#569cd6;">area</span> <span style="color:#6a9955;"># Sends the data back to the main program</span><br><br>
      <span style="color:#569cd6;">total</span> = <span style="color:#dcdcaa;">calculate_area</span>(<span style="color:#b5cea8;">5</span>, <span style="color:#b5cea8;">10</span>)<br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"The area is:"</span>, <span style="color:#569cd6;">total</span>)
    </div>

    <h2 class="section-title">2. Variable Scope</h2>
    <p>Variables declared inside a subroutine are <strong>Local</strong>—they only exist inside that subroutine. Variables declared outside are <strong>Global</strong> and can be accessed anywhere. You must know this distinction for Paper 1.</p>

  `,

  // --- FILE HANDLING ---
  prac_file_handling: `
    <h1>File Handling</h1>
    <p>Data stored in standard variables is lost when the program closes. To save data permanently, we write it to external text files. You must know how to Open, Read, Write, and Close files.</p>

    <h2 class="section-title">1. Writing and Appending</h2>
    <p>To put data into a file, use mode <code>"w"</code> (Write - overwrites existing data) or <code>"a"</code> (Append - adds to the end without deleting).</p>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># WRITE MODE (Overwrites)</span><br>
      <span style="color:#569cd6;">file</span> = <span style="color:#4ec9b0;">open</span>(<span style="color:#ce9178;">"scores.txt"</span>, <span style="color:#ce9178;">"w"</span>)<br>
      <span style="color:#569cd6;">file</span>.write(<span style="color:#ce9178;">"Alice: 85\\n"</span>)<br>
      <span style="color:#569cd6;">file</span>.close() <span style="color:#6a9955;"># ALWAYS close the file!</span><br><br>

      <span style="color:#6a9955;"># APPEND MODE (Adds to the bottom)</span><br>
      <span style="color:#569cd6;">file</span> = <span style="color:#4ec9b0;">open</span>(<span style="color:#ce9178;">"scores.txt"</span>, <span style="color:#ce9178;">"a"</span>)<br>
      <span style="color:#569cd6;">file</span>.write(<span style="color:#ce9178;">"Bob: 92\\n"</span>)<br>
      <span style="color:#569cd6;">file</span>.close()
    </div>

    <h2 class="section-title">2. Reading from Files</h2>
    <p>To get data out of a file, open it in <code>"r"</code> mode. You can read the whole file at once, or iterate through it line by line.</p>

    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># READING EVERYTHING</span><br>
      <span style="color:#569cd6;">file</span> = <span style="color:#4ec9b0;">open</span>(<span style="color:#ce9178;">"scores.txt"</span>, <span style="color:#ce9178;">"r"</span>)<br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#569cd6;">file</span>.read())<br>
      <span style="color:#569cd6;">file</span>.close()<br><br>

      <span style="color:#6a9955;"># READING LINE BY LINE (Exam standard)</span><br>
      <span style="color:#569cd6;">file</span> = <span style="color:#4ec9b0;">open</span>(<span style="color:#ce9178;">"scores.txt"</span>, <span style="color:#ce9178;">"r"</span>)<br>
      <span style="color:#c586c0;">for</span> <span style="color:#9cdcfe;">line</span> <span style="color:#c586c0;">in</span> <span style="color:#569cd6;">file</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Read record:"</span>, <span style="color:#9cdcfe;">line</span>.strip()) <span style="color:#6a9955;"># .strip() removes the invisible \\n new line character</span><br>
      <span style="color:#569cd6;">file</span>.close()
    </div>

  `,

  // --- ROBUST PROGRAMS & VALIDATION ---
  prac_validation: `
    <h1>Robust Programs & Validation</h1>
    <p>Defensive design ensures a program doesn't crash when users type in the wrong thing. We use Validation to check data meets specific rules before the program accepts it.</p>
    
    <h2 class="section-title">1. AQA Validation Checks</h2>
    <p>You must be able to recognise and code these standard validation checks using While loops.</p>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># LENGTH CHECK (Ensures a password is at least 8 chars long)</span><br>
      <span style="color:#569cd6;">pwd</span> = <span style="color:#ce9178;">""</span><br>
      <span style="color:#c586c0;">while</span> <span style="color:#4ec9b0;">len</span>(<span style="color:#569cd6;">pwd</span>) < <span style="color:#b5cea8;">8</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">pwd</span> = <span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter a password (8 chars minimum): "</span>)<br><br>

      <span style="color:#6a9955;"># RANGE CHECK (Ensures a number is between 1 and 10)</span><br>
      <span style="color:#569cd6;">score</span> = -<span style="color:#b5cea8;">1</span><br>
      <span style="color:#c586c0;">while</span> <span style="color:#569cd6;">score</span> < <span style="color:#b5cea8;">1</span> <span style="color:#c586c0;">or</span> <span style="color:#569cd6;">score</span> > <span style="color:#b5cea8;">10</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">score</span> = <span style="color:#4ec9b0;">int</span>(<span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter a rating 1-10: "</span>))<br><br>

      <span style="color:#6a9955;"># PRESENCE CHECK (Ensures the user didn't just hit enter leaving it blank)</span><br>
      <span style="color:#569cd6;">name</span> = <span style="color:#ce9178;">""</span><br>
      <span style="color:#c586c0;">while</span> <span style="color:#569cd6;">name</span> == <span style="color:#ce9178;">""</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">name</span> = <span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Name cannot be blank. Enter name: "</span>)
    </div>

    <h2 class="section-title">2. Error Handling (Try / Except)</h2>
    <p>If a user types "Bob" when you asked for an integer, the program will crash with a ValueError. You can catch these crashes using a <code>try / except</code> block.</p>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#569cd6;">valid_number</span> = <span style="color:#569cd6;">False</span><br>
      <span style="color:#c586c0;">while not</span> <span style="color:#569cd6;">valid_number</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c586c0;">try</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">age</span> = <span style="color:#4ec9b0;">int</span>(<span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter your age in digits: "</span>))<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">valid_number</span> = <span style="color:#569cd6;">True</span> <span style="color:#6a9955;"># Only runs if the line above didn't crash</span><br>
      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c586c0;">except</span> <span style="color:#4ec9b0;">ValueError</span>:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Error! Please type a whole number."</span>)
    </div>

  `,

  // --- BUILT-IN MODULES ---
  prac_modules: `
    <h1>Built-In Modules Cheat Sheet</h1>
    <p>You do not need to memorise the entire Python library for your exam, but you are expected to know how to generate random numbers and round values using Python's built-in tools.</p>
    
    <h2 class="section-title">1. The Random Module</h2>
    <p>To use random functions, you must write <code>import random</code> at the very top of your program.</p>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#c586c0;">import</span> random<br><br>
      
      <span style="color:#6a9955;"># RANDOM.RANDINT(start, end)</span><br>
      <span style="color:#6a9955;"># Generates a random integer between the two numbers (inclusive)</span><br>
      <span style="color:#569cd6;">dice_roll</span> = random.randint(<span style="color:#b5cea8;">1</span>, <span style="color:#b5cea8;">6</span>)<br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"You rolled a"</span>, <span style="color:#569cd6;">dice_roll</span>)<br><br>

      <span style="color:#6a9955;"># RANDOM.CHOICE(list)</span><br>
      <span style="color:#6a9955;"># Picks a random item out of an array/list</span><br>
      <span style="color:#569cd6;">options</span> = [<span style="color:#ce9178;">"Rock"</span>, <span style="color:#ce9178;">"Paper"</span>, <span style="color:#ce9178;">"Scissors"</span>]<br>
      <span style="color:#569cd6;">cpu_move</span> = random.choice(<span style="color:#569cd6;">options</span>)<br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Computer played:"</span>, <span style="color:#569cd6;">cpu_move</span>)
    </div>

    <h2 class="section-title">2. Math & Rounding</h2>
    <p>Rounding is built directly into Python (no import required). If you need more specific mathematical controls like rounding down or up strictly, you can import the <code>math</code> module.</p>
    
    <div style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 20px;">
      <span style="color:#6a9955;"># BUILT-IN ROUND()</span><br>
      <span style="color:#6a9955;"># round(number, decimal_places)</span><br>
      <span style="color:#569cd6;">price</span> = <span style="color:#b5cea8;">14.99872</span><br>
      <span style="color:#dcdcaa;">print</span>(<span style="color:#4ec9b0;">round</span>(<span style="color:#569cd6;">price</span>, <span style="color:#b5cea8;">2</span>)) <span style="color:#6a9955;"># Outputs 15.0</span><br><br>

      <span style="color:#c586c0;">import</span> math<br><br>
      <span style="color:#6a9955;"># MATH.FLOOR (Always rounds down) & MATH.CEIL (Always rounds up)</span><br>
      <span style="color:#569cd6;">bottles</span> = <span style="color:#b5cea8;">5.8</span><br>
      <span style="color:#dcdcaa;">print</span>(math.floor(<span style="color:#569cd6;">bottles</span>)) <span style="color:#6a9955;"># Outputs 5</span><br>
      <span style="color:#dcdcaa;">print</span>(math.ceil(<span style="color:#569cd6;">bottles</span>)) <span style="color:#6a9955;"># Outputs 6</span>
    </div>

  `,

  // --- 3.1 ALGORITHMS ---
  p1_algo: `
    <h1>3.1 Fundamentals of Algorithms</h1>
    <p>Computational thinking is an approach to problem solving used to fully understand a problem and create an effective solution.</p>

    <div class="homework-box">
      <h2 class="section-title" style="margin-top: 0;">Computational Thinking Techniques</h2>
      <p>Three main techniques underpin how we solve problems computationally:</p>
      <div class="card-grid">
        <div class="card">
          <h3>Abstraction</h3>
          <p>Moving from the real to the virtual. It involves removing unnecessary details to focus only on the essential features of the problem.<br><br><em>Example: The London Underground map ignores physical distances to focus purely on connections.</em></p>
        </div>
        <div class="card">
          <h3>Decomposition</h3>
          <p>Breaking down a large, complex problem into smaller sub-problems that are easier to solve individually.<br><br><em>Visualisation: Often represented using 'Top-Down' tree diagrams.</em></p>
        </div>
        <div class="card">
          <h3>Algorithmic Thinking</h3>
          <p>Thinking in a structured, logical way. It involves identifying the specific steps required to reach a desired result (the algorithm).</p>
        </div>
      </div>
    </div>

    <div class="homework-box">
      <h2 class="section-title">3.1.1 Representing Algorithms</h2>
      <p>Algorithms are independent of programming languages. We use two main methods to plan them: <strong>Flowcharts</strong> and <strong>Pseudocode</strong>.</p>
      
      <div class="card-grid">
        <div class="card">
          <h3>Flowchart (Find Max)</h3>
          <p>A visual representation using standard shapes to show program logic.</p>

          <div style="background: var(--card-bg); padding: 10px; border-radius: 8px; display: flex; justify-content: center; align-items: center; min-height: 420px; border: 1px solid var(--border);">
            <svg viewBox="0 0 400 650" role="img"
              aria-label="Flowchart for the Find Max algorithm: start, set maxVal to list[0] and i to 1, then while i is less than the length of the list, if list[i] is greater than maxVal set maxVal to list[i], add one to i and repeat; when the loop ends, output maxVal and stop."
              style="max-width: 100%; height: auto; font-family: 'Segoe UI', Arial, sans-serif;">
              <g fill="none" stroke="var(--text)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <!-- connectors -->
                <path d="M175 48 V 68" marker-end="url(#fc-arrow)" />
                <path d="M175 120 V 140" marker-end="url(#fc-arrow)" />
                <path d="M175 228 V 248" marker-end="url(#fc-arrow)" />
                <path d="M175 340 V 360" marker-end="url(#fc-arrow)" />
                <path d="M175 405 V 428" marker-end="url(#fc-arrow)" />
                <!-- false branch of the inner test rejoins above i = i + 1 -->
                <path d="M270 295 H 300 V 428 H 180" marker-end="url(#fc-arrow)" />
                <!-- loop back to the top of the loop test -->
                <path d="M175 473 V 495 H 20 V 185 H 76" marker-end="url(#fc-arrow)" />
                <!-- loop exit -->
                <path d="M270 185 H 340 V 545 H 272" marker-end="url(#fc-arrow)" />
                <path d="M175 568 V 588" marker-end="url(#fc-arrow)" />
              </g>

              <defs>
                <marker id="fc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="var(--text)" />
                </marker>
              </defs>

              <g stroke="#0D2137" stroke-width="2" fill="#B3CDE0">
                <rect x="110" y="8" width="130" height="40" rx="20" />
                <rect x="85" y="68" width="180" height="52" />
                <path d="M175 140 L270 185 L175 230 L80 185 Z" />
                <path d="M175 248 L270 295 L175 342 L80 295 Z" />
                <rect x="90" y="360" width="170" height="45" />
                <rect x="105" y="428" width="140" height="45" />
                <path d="M97 524 H268 L246 568 H75 Z" />
                <rect x="110" y="588" width="130" height="40" rx="20" />
              </g>

              <g fill="#0D2137" font-size="14" text-anchor="middle">
                <text x="175" y="33" font-weight="700">START</text>
                <text x="175" y="89">maxVal &#8592; list[0]</text>
                <text x="175" y="108">i &#8592; 1</text>
                <text x="175" y="190">i &lt; length(list)?</text>
                <text x="175" y="300">list[i] &gt; maxVal?</text>
                <text x="175" y="388">maxVal &#8592; list[i]</text>
                <text x="175" y="456">i &#8592; i + 1</text>
                <text x="172" y="551">OUTPUT maxVal</text>
                <text x="175" y="613" font-weight="700">STOP</text>
              </g>

              <g fill="var(--text)" font-size="12" font-weight="700">
                <text x="186" y="245">Yes</text>
                <text x="288" y="178">No</text>
                <text x="186" y="357">Yes</text>
                <text x="278" y="289">No</text>
              </g>
            </svg>
          </div>

          <p style="font-size: 0.8rem; color: var(--text-light); margin-top: 10px;"><em>Oval = Start/Stop, Rectangle = Process, Diamond = Decision, Parallelogram = Input/Output.</em></p>
        </div>

        <div class="card">
          <h3>Flowchart Symbols</h3>
          <p>The standard shapes, and what each one means. Learn these &mdash; questions often ask you to name a symbol or draw one.</p>

          <div style="background: var(--card-bg); padding: 10px; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid var(--border);">
            <img src="./basic-symbols-table.jpg" alt="Table of standard flowchart symbols: an oval for start and end, arrows for connectors, a parallelogram for input and output, a rectangle for a process, and a diamond for a decision." style="max-width: 100%; height: auto; border-radius: 4px;" loading="lazy">
          </div>
        </div>

        <div class="card">
          <h3>Pseudocode (Find Max)</h3>
          <p>A text-based method that mimics code but uses plain English.</p>
          
          <div style="background: #111; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 1rem; color: #0f0; line-height: 1.4; border: 1px solid #333; height: 420px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
            <div>
              <span style="color: #4a90e2;">FUNCTION</span> FindMax(list)<br>
              &nbsp;&nbsp;<span style="color: #4a90e2;">SET</span> maxVal <span style="color: #4a90e2;">TO</span> list[0]<br><br>
              &nbsp;&nbsp;<span style="color: #f5a623;">FOR</span> each item <span style="color: #f5a623;">IN</span> list<br>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #f5a623;">IF</span> item > maxVal <span style="color: #f5a623;">THEN</span><br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #4a90e2;">SET</span> maxVal <span style="color: #4a90e2;">TO</span> item<br>
              &nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #f5a623;">END IF</span><br>
              &nbsp;&nbsp;<span style="color: #f5a623;">END FOR</span><br><br>
              &nbsp;&nbsp;<span style="color: #4a90e2;">RETURN</span> maxVal<br>
              <span style="color: #4a90e2;">END FUNCTION</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="homework-box">
      <h2 class="section-title">Trace Tables (Dry Running)</h2>
      <p>A <strong>trace table</strong> is used to manually walk through an algorithm step-by-step, recording the value of every variable after each line. This is the most reliable way to find <strong>logic errors</strong> — bugs where the program runs but produces the wrong answer.</p>

      <div class="card-grid">
        <div class="card" style="border-top: 5px solid var(--dark-purple);">
          <h3>Worked Example: Counting Down</h3>
          <p>Trace this pseudocode for an input of <code>n = 4</code>:</p>
          <div style="background: #111; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; color: #0f0; font-size: 0.95rem;">
            count &larr; 0<br>
            WHILE n &gt; 0<br>
            &nbsp;&nbsp;count &larr; count + n<br>
            &nbsp;&nbsp;n &larr; n - 1<br>
            ENDWHILE<br>
            OUTPUT count
          </div>
          <table style="width:100%; border-collapse: collapse; text-align: center; margin-top: 15px; background: var(--card-bg); border: 1px solid var(--border);">
            <tr style="background: var(--border); color: var(--dark-purple); font-weight: bold;">
              <td style="padding: 8px; border: 1px solid var(--border);">n</td>
              <td style="padding: 8px; border: 1px solid var(--border);">count</td>
              <td style="padding: 8px; border: 1px solid var(--border);">n &gt; 0?</td>
              <td style="padding: 8px; border: 1px solid var(--border);">Output</td>
            </tr>
            <tr><td style="padding: 6px; border: 1px solid var(--border);">4</td><td style="padding: 6px; border: 1px solid var(--border);">0</td><td style="padding: 6px; border: 1px solid var(--border);">True</td><td style="padding: 6px; border: 1px solid var(--border);">-</td></tr>
            <tr><td style="padding: 6px; border: 1px solid var(--border);">3</td><td style="padding: 6px; border: 1px solid var(--border);">4</td><td style="padding: 6px; border: 1px solid var(--border);">True</td><td style="padding: 6px; border: 1px solid var(--border);">-</td></tr>
            <tr><td style="padding: 6px; border: 1px solid var(--border);">2</td><td style="padding: 6px; border: 1px solid var(--border);">7</td><td style="padding: 6px; border: 1px solid var(--border);">True</td><td style="padding: 6px; border: 1px solid var(--border);">-</td></tr>
            <tr><td style="padding: 6px; border: 1px solid var(--border);">1</td><td style="padding: 6px; border: 1px solid var(--border);">9</td><td style="padding: 6px; border: 1px solid var(--border);">True</td><td style="padding: 6px; border: 1px solid var(--border);">-</td></tr>
            <tr><td style="padding: 6px; border: 1px solid var(--border);">0</td><td style="padding: 6px; border: 1px solid var(--border);">10</td><td style="padding: 6px; border: 1px solid var(--border);">False</td><td style="padding: 6px; border: 1px solid var(--border);"><strong>10</strong></td></tr>
          </table>
          <p style="font-size: 0.9rem; margin-top: 10px;"><em>The program totals 4+3+2+1 and outputs <strong>10</strong>.</em></p>
        </div>

        <div class="card" style="border-top: 5px solid var(--accent-green);">
          <h3>Why Use Trace Tables?</h3>
          <ul>
            <li><strong>Find logic errors</strong> that don't crash the program.</li>
            <li><strong>Predict</strong> what an algorithm will output before running it.</li>
            <li><strong>Compare</strong> two algorithms to see which uses fewer steps.</li>
            <li><strong>Common in exams</strong> — questions ask "what is the value of X after the loop?"</li>
          </ul>
          <h4 style="margin-top: 15px; color: var(--dark-purple);">Top Tips</h4>
          <ul>
            <li>Add a column for every variable that changes.</li>
            <li>Add a column for the loop/IF condition (True/False).</li>
            <li>Only fill in <strong>Output</strong> when an OUTPUT/PRINT line runs.</li>
            <li>Write a new row each time a value changes — never overwrite.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="homework-box">
      <h2 class="section-title">3.1.2 Efficiency of Algorithms</h2>
      <p>Two algorithms can solve the same problem but at very different speeds and memory costs. We measure efficiency in two ways:</p>

      <div class="card-grid">
        <div class="card" style="border-top: 5px solid var(--accent-blue);">
          <h3>Time Efficiency</h3>
          <p>How many <strong>steps</strong> the algorithm performs as the input size <code>n</code> grows. Fewer steps = faster.</p>
          <ul>
            <li><strong>Best case:</strong> The minimum number of steps (e.g., target found on first check).</li>
            <li><strong>Worst case:</strong> The maximum number of steps (e.g., target not in the list).</li>
            <li><strong>Average case:</strong> The expected number of steps over many runs.</li>
          </ul>
        </div>
        <div class="card" style="border-top: 5px solid var(--accent-yellow);">
          <h3>Space Efficiency</h3>
          <p>How much <strong>working memory (RAM)</strong> the algorithm uses while running.</p>
          <ul>
            <li><strong>In-place</strong> algorithms (e.g., Bubble Sort) modify the original list and use very little extra memory.</li>
            <li><strong>Out-of-place</strong> algorithms (e.g., Merge Sort) create copies, using more memory but often saving time.</li>
          </ul>
        </div>
      </div>

      <h3 style="margin-top: 20px;">Comparison: Searching & Sorting Algorithms</h3>
      <table style="width:100%; border-collapse: collapse; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
        <tr style="background: var(--brand-surface); color: white; font-weight: bold;">
          <td style="padding: 10px; border: 1px solid var(--border);">Algorithm</td>
          <td style="padding: 10px; border: 1px solid var(--border);">Speed (Time)</td>
          <td style="padding: 10px; border: 1px solid var(--border);">Memory (Space)</td>
          <td style="padding: 10px; border: 1px solid var(--border);">List Must Be Sorted?</td>
        </tr>
        <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Linear Search</strong></td><td style="padding: 8px; border: 1px solid var(--border);">Slow on large lists</td><td style="padding: 8px; border: 1px solid var(--border);">Very low</td><td style="padding: 8px; border: 1px solid var(--border);">No</td></tr>
        <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Binary Search</strong></td><td style="padding: 8px; border: 1px solid var(--border);">Very fast</td><td style="padding: 8px; border: 1px solid var(--border);">Very low</td><td style="padding: 8px; border: 1px solid var(--border);">Yes</td></tr>
        <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Bubble Sort</strong></td><td style="padding: 8px; border: 1px solid var(--border);">Slow (many swaps)</td><td style="padding: 8px; border: 1px solid var(--border);">Very low (in-place)</td><td style="padding: 8px; border: 1px solid var(--border);">N/A</td></tr>
        <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Merge Sort</strong></td><td style="padding: 8px; border: 1px solid var(--border);">Fast on large lists</td><td style="padding: 8px; border: 1px solid var(--border);">Higher (sub-lists)</td><td style="padding: 8px; border: 1px solid var(--border);">N/A</td></tr>
      </table>
    </div>

    <div class="homework-box">
      <h2 class="section-title">3.1.3 Searching Algorithms</h2>
      <p>Standard methods for finding specific data within a list.</p>
      <div class="card-grid">
        <div class="card">
          <h3>Linear Search</h3>
          <p>Checks every item one by one from the start until the item is found.</p>
          <ul>
            <li><strong>Prerequisite:</strong> None (list can be unordered).</li>
            <li><strong>Efficiency:</strong> Slow for large lists. In the worst case, it checks every item.</li>
          </ul>
          <button onclick="loadContent('p1_linear_viz')" style="margin-top: 10px; padding: 8px 15px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Visualise</button>
        </div>
        <div class="card">
          <h3>Binary Search</h3>
          <p>A 'Divide and Conquer' algorithm. It checks the middle item; if the target is lower, it discards the top half (and vice-versa), repeatedly halving the list.</p>
          <ul>
            <li><strong>Prerequisite:</strong> The list <strong>MUST</strong> be sorted.</li>
            <li><strong>Efficiency:</strong> Extremely fast for large lists.</li>
          </ul>
          <button onclick="loadContent('p1_binary_viz')" style="margin-top: 10px; padding: 8px 15px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Visualise</button>
        </div>
      </div>
    </div>

    <div class="homework-box">
      <h2 class="section-title">3.1.4 Sorting Algorithms</h2>
      <p>Standard methods for organising data into order (e.g., alphabetical or numerical).</p>
      <div class="card-grid">
        <div class="card">
          <h3>Bubble Sort</h3>
          <p>Repeatedly steps through the list, comparing adjacent pairs and swapping them if they are in the wrong order. Sorting finishes once a full pass occurs with <strong>no swaps</strong>.</p>
          <ul>
            <li><strong>Method:</strong> Uses 'passes'. A pass is one full run through the list.</li>
            <li><strong>Pros:</strong> Easy to code; uses very little memory (sorts "in-place").</li>
            <li><strong>Cons:</strong> Very inefficient for large datasets; many swaps means slow performance.</li>
          </ul>
          <button onclick="loadContent('p1_bubble_viz')" style="padding: 8px 15px; background: var(--accent-green-strong); color: white; border: none; border-radius: 5px; cursor: pointer;">Visualise</button>
        </div>
        <div class="card">
          <h3>Merge Sort</h3>
          <p>Another 'Divide and Conquer' algorithm. It splits the list repeatedly into individual items, then merges them back together in the correct order.</p>
          <ul>
            <li><strong>Pros:</strong> Much faster than Bubble Sort on large datasets; predictable performance.</li>
            <li><strong>Cons:</strong> Uses more memory because temporary sub-lists are created during the split phase; harder to code.</li>
          </ul>
          <button onclick="loadContent('p1_merge_viz')" style="margin-top: 10px; padding: 8px 15px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Visualise</button>
        </div>
      </div>
    </div>

    <div class="homework-box">
      <h2 class="section-title">Key Definitions</h2>
      <div class="card-grid">
        <div class="card">
          <h3>Algorithm</h3>
          <p>A set of step-by-step instructions used to solve a problem or perform a task.</p>
        </div>
        <div class="card">
          <h3>Abstraction</h3>
          <p>Removing or hiding unnecessary detail so we focus only on the parts that matter to the problem.</p>
        </div>
        <div class="card">
          <h3>Decomposition</h3>
          <p>Breaking a large, complex problem down into smaller, manageable sub-problems.</p>
        </div>
        <div class="card">
          <h3>Pseudocode</h3>
          <p>A structured, English-like way to plan an algorithm without worrying about strict programming language rules.</p>
        </div>
        <div class="card">
          <h3>Flowchart</h3>
          <p>A visual diagram of an algorithm using standard shapes: <em>oval</em> (start/end), <em>parallelogram</em> (input/output), <em>rectangle</em> (process), <em>diamond</em> (decision).</p>
        </div>
        <div class="card">
          <h3>Trace Table</h3>
          <p>A table used to record the value of every variable as an algorithm runs, used to find logic errors.</p>
        </div>
      </div>
    </div>

  `,

  visualizations: `
    <h1>Visualizations Hub</h1>
    <p>Explore interactive animations and step-by-step visual breakdowns of algorithms and system processes.</p>

    <h2 class="section-title">Paper 1: Algorithms</h2>
    <div class="card-grid">
      <div class="card" onclick="loadContent('p1_linear_viz')" style="cursor: pointer; border-top: 5px solid var(--accent-blue);">
        <h3>Linear Search</h3>
        <p>Watch how a sequential search checks every item one by one.</p>
      </div>
      <div class="card" onclick="loadContent('p1_binary_viz')" style="cursor: pointer; border-top: 5px solid var(--accent-blue);">
        <h3>Binary Search</h3>
        <p>See the 'Divide and Conquer' method halve a sorted list.</p>
      </div>
      <div class="card" onclick="loadContent('p1_bubble_viz')" style="cursor: pointer; border-top: 5px solid var(--accent-green);">
        <h3>Bubble Sort</h3>
        <p>Visualise adjacent elements swapping into the correct order.</p>
      </div>
      <div class="card" onclick="loadContent('p1_merge_viz')" style="cursor: pointer; border-top: 5px solid var(--accent-green);">
        <h3>Merge Sort</h3>
        <p>Watch a list decompose and merge back together in order.</p>
      </div>
    </div>

    <h2 class="section-title">Paper 2: Cyber Security</h2>
    <div class="card-grid">
      <div class="card" onclick="loadContent('p2_threat_viz')" style="cursor: pointer; border-top: 5px solid var(--accent-red);">
        <h3>Threat Logic</h3>
        <p>Step-by-step logic of how Viruses, Worms, Trojans, and Phishing work.</p>
      </div>
      <div class="card" onclick="loadContent('p2_attack_viz')" style="cursor: pointer; border-top: 5px solid var(--accent-red);">
        <h3>Technical Attacks</h3>
        <p>Simulate Brute Force, DoS, and SQL Injection attacks on a server.</p>
      </div>
    </div>
  `,

  p1_linear_viz: `
  <h1>Linear Search Visualisation</h1>
  <p>Linear search iterates through elements sequentially. It works on any array, even if it is not sorted.</p>
  
  <div style="background: #111; padding: 40px 20px; border-radius: 12px; margin: 20px 0; text-align: center; overflow-x: auto;">
    <div id="viz-status" style="color: #fff; font-family: monospace; margin-bottom: 20px; font-size: 1.2rem;">Target: <span id="linear-target-val">--</span></div>
    
    <div class="viz-scroll">
      <div id="linear-viz-container" style="display: block; position: relative; height: 100px; width: 850px; margin: 0 auto 30px auto;"></div>
    </div>
    
    <div id="linear-viz-info" style="color: #ccc; font-family: monospace; margin-bottom: 20px; height: 24px;">Click 'Start' to begin</div>
    
    <div style="display: flex; justify-content: center; gap: 10px;">
      <button onclick="startLinearSearch()" id="linear-start-btn" style="padding: 10px 25px; background: var(--accent-green-strong); color: white; border: none; border-radius: 5px; cursor: pointer;">Start Animation</button>
      <button onclick="loadContent('p1_linear_viz')" style="padding: 10px 25px; background: #555; color: white; border: none; border-radius: 5px; cursor: pointer;">Reset</button>
    </div>
  </div>

  <div class="homework-box">
    <h3>Algorithm Efficiency</h3>
    <ul>
      <li><strong>Time Complexity:</strong> O(n) — In the worst case, you must check all n items.</li>
      <li><strong>Prerequisite:</strong> None. Unlike Binary Search, the list does <strong>not</strong> need to be sorted.</li>
    </ul>
  </div>

`,

  p1_binary_viz: `
  <h1>Binary Search Visualisation</h1>
  <p>Binary search works by repeatedly halving the search range. The list <strong>must</strong> be sorted first.</p>
  
  <div style="background: #111; padding: 40px; border-radius: 12px; margin: 20px 0; text-align: center;">
    <div id="viz-status" style="color: #fff; font-family: monospace; margin-bottom: 20px; font-size: 1.2rem;">Target: <span id="target-val">--</span></div>
    
    <div class="viz-scroll">
      <div id="binary-viz-container" style="display: flex; align-items: flex-end; justify-content: center; height: 200px; width: 350px; margin: 0 auto 30px auto; gap: 4px; position: relative;"></div>
    </div>
    
    <div id="viz-step-info" style="color: #ccc; font-family: monospace; margin-bottom: 20px; height: 24px;">Click 'Start' to begin</div>
    
    <div style="display: flex; justify-content: center; gap: 10px;">
      <button onclick="startBinarySearch()" id="binary-start-btn" style="padding: 10px 25px; background: var(--accent-green-strong); color: white; border: none; border-radius: 5px; cursor: pointer;">Start Animation</button>
      <button onclick="loadContent('p1_binary_viz')" style="padding: 10px 25px; background: #555; color: white; border: none; border-radius: 5px; cursor: pointer;">Reset</button>
    </div>
  </div>

  <div class="homework-box">
    <h3>Complexity Stats</h3>
    <ul>
      <li><strong>Time Complexity:</strong> O(\log n) — The search area halves every single step.</li>
      <li><strong>Space Complexity:</strong> O(1) — It doesn't require extra memory for copies.</li>
    </ul>
  </div>

`,

  p1_bubble_viz: `
  <h1>Bubble Sort Visualisation</h1>
  <p>Watch how the algorithm compares adjacent elements and "bubbles" the largest values to the end of the list.</p>
  
  <div style="background: #111; padding: 40px; border-radius: 12px; margin: 20px 0; text-align: center;">
    <div class="viz-scroll">
      <div id="viz-container" style="display: flex; align-items: flex-end; position: relative; height: 200px; width: 310px; margin: 0 auto 30px auto;"></div>
    </div>
    <div id="viz-status" style="color: #fff; font-family: monospace; margin-bottom: 20px; height: 20px;">Click 'Start' to begin sorting</div>
    
    <div style="display: flex; justify-content: center; gap: 10px;">
      <button onclick="startBubbleSort()" id="start-btn" style="padding: 10px 25px; background: var(--accent-green-strong); color: white; border: none; border-radius: 5px; cursor: pointer;">Start Animation</button>
      <button onclick="loadContent('p1_bubble_viz')" style="padding: 10px 25px; background: #555; color: white; border: none; border-radius: 5px; cursor: pointer;">Reset</button>
    </div>
  </div>

  <div class="homework-box">
    <h3>Complexity Stats</h3>
    <ul>
      <li><strong>Time Complexity:</strong> O(n^2) — It uses nested loops to compare every item. </li>
      <li><strong>Space Complexity:</strong> O(1) — It sorts the list "in-place" without needing extra memory. </li>
    </ul>
  </div>

`,

  p1_merge_viz: `
  <h1>Merge Sort Visualisation</h1>
  <p>Decomposing a 10-digit list. Watch the recursive <strong>Split</strong> (Divide) and the <strong>Merge</strong> (Conquer) phases as the algorithm builds the sorted list.</p>
  
  <div style="background: #111; padding: 40px 20px; border-radius: 12px; margin: 20px 0; text-align: center; overflow-x: auto;">
    <div id="merge-viz-container" style="display: block; position: relative; height: 450px; width: 850px; margin: 0 auto 20px auto;">
      </div>
    
    <div id="merge-viz-status" style="color: #fff; font-family: monospace; margin-top: 30px; margin-bottom: 20px; height: 30px; font-size: 1.1rem; border-top: 1px solid #333; padding-top: 15px;">
      Ready to sort 10 digits...
    </div>
    
    <div style="display: flex; justify-content: center; gap: 10px;">
      <button onclick="startMergeSort()" id="merge-start-btn" style="padding: 10px 25px; background: var(--accent-green-strong); color: white; border: none; border-radius: 5px; cursor: pointer;">Start Animation</button>
      <button onclick="loadContent('p1_merge_viz')" style="padding: 10px 25px; background: #555; color: white; border: none; border-radius: 5px; cursor: pointer;">Reset</button>
    </div>
  </div>

  <div class="homework-box">
    <h2 class="section-title">Algorithm Breakdown</h2>
    <ul>
      <li><strong>Divide:</strong> The 10-item list is split until sub-lists contain only 1 element.</li>
      <li><strong>Merge:</strong> Elements are compared and moved into the correct order in a temporary array.</li>
    </ul>
  </div>

`,

  // --- 3.2 PROGRAMMING FUNDAMENTALS (Updated with Logic, Pros, and Cons) ---
  p1_prog: `
    <h1>3.2 Programming Fundamentals</h1>
    <p>Programming involves using specific constructs to create instructions that a computer can process. Professional programmers aim to write code that is modular, easy to debug, and robust against errors.</p>

    <h2 class="section-title">3.2.1 Data Types</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Inputs, Variables & Constants</h3>
        <p><strong>Variables</strong> store data that can change, while <strong>Constants</strong> store data that remains fixed. Using constants prevents accidental changes to important values like PI or tax rates.</p>
        <ul>
          <li><strong>Pros:</strong> Variables make code dynamic and adaptable; constants improve security and readability.</li>
          <li><strong>Cons:</strong> Overusing variables can lead to high memory usage; failing to use constants makes code harder to maintain.</li>
        </ul>
        <button onclick="loadContent('act_io')" style="margin-top: 10px; padding: 8px 15px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Try I/O Activity</button>
      </div>
      <div class="card">
        <h3>Data Types & Casting</h3>
        <p>Data types (Integer, Real, Boolean, String) tell the computer how much memory to allocate. <strong>Casting</strong> is essential for converting user input (always a string) into numbers for calculations.</p>
        <ul>
          <li><strong>Pros:</strong> Casting allows mathematical operations on text-based inputs.</li>
          <li><strong>Cons:</strong> Incorrect casting (e.g., trying to turn "Hello" into an Int) will crash the program with a ValueError.</li>
        </ul>
        <button onclick="loadContent('act_casting')" style="margin-top: 10px; padding: 8px 15px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Casting Activity</button>
      </div>
    </div>

    <h2 class="section-title">3.2.2 Programming Concepts</h2>
    <p>The three core building blocks of every program: <strong>sequence</strong>, <strong>selection</strong>, and <strong>iteration</strong>.</p>
    <div class="card-grid">
      <div class="card">
        <h3>Sequence</h3>
        <p>Statements run one after another in the order they are written. This is the default flow of any program.</p>
        <ul>
          <li><strong>Pros:</strong> Simple and predictable.</li>
          <li><strong>Cons:</strong> Can't make decisions or repeat steps without selection or iteration.</li>
        </ul>
      </div>
      <div class="card">
        <h3>Selection (If-Else)</h3>
        <p>Selection allows a program to take different paths based on conditions. This is used to create logic, such as checking if a password is correct or a player has enough health.</p>
        <ul>
          <li><strong>Pros:</strong> Essential for making code "smart" and reactive to user choices.</li>
          <li><strong>Cons:</strong> Deeply nested "If" statements (Spaghetti Code) become extremely difficult to read and debug.</li>
        </ul>
        <button onclick="loadContent('act_selection')" style="margin-top: 10px; padding: 8px 15px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Selection Activity</button>
      </div>
      <div class="card">
        <h3>Iteration (Loops)</h3>
        <p>Iteration repeats code. <strong>FOR loops</strong> are used when you know the number of repeats; <strong>WHILE loops</strong> are used when the repeats depend on a condition (like waiting for a correct password).</p>
        <ul>
          <li><strong>Pros:</strong> Dramatically reduces the number of lines of code; makes code more efficient.</li>
          <li><strong>Cons:</strong> Infinite loops (where the exit condition is never met) will cause the program to hang or crash.</li>
        </ul>
        <button onclick="loadContent('act_loops')" style="margin-top: 10px; padding: 8px 15px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Loops Activity</button>
      </div>
    </div>

    <h2 class="section-title">3.2.3 Arithmetic Operations</h2>
    <p>Programs perform calculations using <strong>arithmetic operators</strong>. The two most easily forgotten are integer division (DIV / <code>//</code>) and modulus (MOD / <code>%</code>).</p>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--accent-blue);">
        <h3>Operators</h3>
        <table style="width:100%; border-collapse: collapse; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
          <tr style="background: var(--border); font-weight: bold;">
            <td style="padding: 8px; border: 1px solid var(--border);">Operation</td>
            <td style="padding: 8px; border: 1px solid var(--border);">Symbol</td>
            <td style="padding: 8px; border: 1px solid var(--border);">Example</td>
            <td style="padding: 8px; border: 1px solid var(--border);">Result</td>
          </tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);">Add</td><td style="padding: 8px; border: 1px solid var(--border);"><code>+</code></td><td style="padding: 8px; border: 1px solid var(--border);"><code>5 + 3</code></td><td style="padding: 8px; border: 1px solid var(--border);">8</td></tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);">Subtract</td><td style="padding: 8px; border: 1px solid var(--border);"><code>-</code></td><td style="padding: 8px; border: 1px solid var(--border);"><code>5 - 3</code></td><td style="padding: 8px; border: 1px solid var(--border);">2</td></tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);">Multiply</td><td style="padding: 8px; border: 1px solid var(--border);"><code>*</code></td><td style="padding: 8px; border: 1px solid var(--border);"><code>5 * 3</code></td><td style="padding: 8px; border: 1px solid var(--border);">15</td></tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);">Real Divide</td><td style="padding: 8px; border: 1px solid var(--border);"><code>/</code></td><td style="padding: 8px; border: 1px solid var(--border);"><code>7 / 2</code></td><td style="padding: 8px; border: 1px solid var(--border);">3.5</td></tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);">Integer Divide (DIV)</td><td style="padding: 8px; border: 1px solid var(--border);"><code>//</code></td><td style="padding: 8px; border: 1px solid var(--border);"><code>7 // 2</code></td><td style="padding: 8px; border: 1px solid var(--border);">3</td></tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);">Modulus (MOD)</td><td style="padding: 8px; border: 1px solid var(--border);"><code>%</code></td><td style="padding: 8px; border: 1px solid var(--border);"><code>7 % 2</code></td><td style="padding: 8px; border: 1px solid var(--border);">1</td></tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);">Exponent</td><td style="padding: 8px; border: 1px solid var(--border);"><code>**</code></td><td style="padding: 8px; border: 1px solid var(--border);"><code>2 ** 3</code></td><td style="padding: 8px; border: 1px solid var(--border);">8</td></tr>
        </table>
        <p style="margin-top: 10px; font-size: 0.9rem;"><strong>Order of operations (BIDMAS):</strong> Brackets &rarr; Indices &rarr; Division/Multiplication &rarr; Addition/Subtraction.</p>
      </div>

      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Worked Example: Odd or Even?</h3>
        <p>The MOD operator is the standard way to test whether a number is even or odd, because it gives the <strong>remainder</strong> of a division.</p>
        <div style="background: #111; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; color: #0f0; font-size: 0.95rem;">
          num &larr; USERINPUT<br>
          IF num MOD 2 = 0 THEN<br>
          &nbsp;&nbsp;OUTPUT 'Even'<br>
          ELSE<br>
          &nbsp;&nbsp;OUTPUT 'Odd'<br>
          ENDIF
        </div>
        <ul style="margin-top: 10px;">
          <li><code>10 MOD 2</code> &rarr; 0 (Even)</li>
          <li><code>7 MOD 2</code> &rarr; 1 (Odd)</li>
          <li><code>10 DIV 3</code> &rarr; 3 (whole number of times 3 fits in 10)</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title">3.2.4 Relational Operations</h2>
    <p>Relational operators compare two values and always return a <strong>Boolean</strong> (True or False). They are used inside <code>IF</code> statements and loops.</p>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--accent-blue);">
        <h3>The Six Operators</h3>
        <table style="width:100%; border-collapse: collapse; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
          <tr style="background: var(--border); font-weight: bold;">
            <td style="padding: 8px; border: 1px solid var(--border);">Operator</td>
            <td style="padding: 8px; border: 1px solid var(--border);">Meaning</td>
            <td style="padding: 8px; border: 1px solid var(--border);">Example</td>
          </tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);"><code>==</code></td><td style="padding: 8px; border: 1px solid var(--border);">Equal to</td><td style="padding: 8px; border: 1px solid var(--border);"><code>5 == 5</code> &rarr; True</td></tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);"><code>!=</code></td><td style="padding: 8px; border: 1px solid var(--border);">Not equal to</td><td style="padding: 8px; border: 1px solid var(--border);"><code>5 != 3</code> &rarr; True</td></tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);"><code>&lt;</code></td><td style="padding: 8px; border: 1px solid var(--border);">Less than</td><td style="padding: 8px; border: 1px solid var(--border);"><code>3 &lt; 5</code> &rarr; True</td></tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);"><code>&gt;</code></td><td style="padding: 8px; border: 1px solid var(--border);">Greater than</td><td style="padding: 8px; border: 1px solid var(--border);"><code>3 &gt; 5</code> &rarr; False</td></tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);"><code>&lt;=</code></td><td style="padding: 8px; border: 1px solid var(--border);">Less than or equal</td><td style="padding: 8px; border: 1px solid var(--border);"><code>5 &lt;= 5</code> &rarr; True</td></tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);"><code>&gt;=</code></td><td style="padding: 8px; border: 1px solid var(--border);">Greater than or equal</td><td style="padding: 8px; border: 1px solid var(--border);"><code>5 &gt;= 6</code> &rarr; False</td></tr>
        </table>
        <p style="margin-top: 10px; font-size: 0.9rem;"><strong>Watch out:</strong> <code>=</code> assigns a value, but <code>==</code> compares two values. Mixing them up is a very common bug.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-yellow);">
        <h3>Worked Example: Pass or Fail?</h3>
        <div style="background: #111; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; color: #0f0; font-size: 0.95rem;">
          score &larr; 72<br>
          IF score &gt;= 70 THEN<br>
          &nbsp;&nbsp;OUTPUT 'Distinction'<br>
          ELSE IF score &gt;= 50 THEN<br>
          &nbsp;&nbsp;OUTPUT 'Pass'<br>
          ELSE<br>
          &nbsp;&nbsp;OUTPUT 'Fail'<br>
          ENDIF
        </div>
        <p style="margin-top: 10px;"><strong>Output:</strong> <code>Distinction</code> &mdash; the first condition (<code>72 &gt;= 70</code>) is True so the program does not check the others.</p>
      </div>
    </div>

    <h2 class="section-title">3.2.5 Boolean Operations</h2>
    <p>Boolean operators (<strong>AND, OR, NOT</strong>) combine simple True/False conditions into more complex tests. The exam often asks you to fill in a <strong>truth table</strong>.</p>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>AND</h3>
        <p>True only when <strong>both</strong> inputs are True.</p>
        <table style="width:100%; border-collapse: collapse; text-align: center; background: var(--card-bg); border: 1px solid var(--border);">
          <tr style="background: var(--border); font-weight: bold;"><td style="padding: 6px; border: 1px solid var(--border);">A</td><td style="padding: 6px; border: 1px solid var(--border);">B</td><td style="padding: 6px; border: 1px solid var(--border);">A AND B</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">F</td><td style="padding: 6px; border: 1px solid var(--border);">F</td><td style="padding: 6px; border: 1px solid var(--border);">F</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">F</td><td style="padding: 6px; border: 1px solid var(--border);">T</td><td style="padding: 6px; border: 1px solid var(--border);">F</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">T</td><td style="padding: 6px; border: 1px solid var(--border);">F</td><td style="padding: 6px; border: 1px solid var(--border);">F</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">T</td><td style="padding: 6px; border: 1px solid var(--border);">T</td><td style="padding: 6px; border: 1px solid var(--border);">T</td></tr>
        </table>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em>Example: <code>age &gt;= 18 AND has_id == True</code></em></p>
      </div>
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>OR</h3>
        <p>True when <strong>at least one</strong> input is True.</p>
        <table style="width:100%; border-collapse: collapse; text-align: center; background: var(--card-bg); border: 1px solid var(--border);">
          <tr style="background: var(--border); font-weight: bold;"><td style="padding: 6px; border: 1px solid var(--border);">A</td><td style="padding: 6px; border: 1px solid var(--border);">B</td><td style="padding: 6px; border: 1px solid var(--border);">A OR B</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">F</td><td style="padding: 6px; border: 1px solid var(--border);">F</td><td style="padding: 6px; border: 1px solid var(--border);">F</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">F</td><td style="padding: 6px; border: 1px solid var(--border);">T</td><td style="padding: 6px; border: 1px solid var(--border);">T</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">T</td><td style="padding: 6px; border: 1px solid var(--border);">F</td><td style="padding: 6px; border: 1px solid var(--border);">T</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">T</td><td style="padding: 6px; border: 1px solid var(--border);">T</td><td style="padding: 6px; border: 1px solid var(--border);">T</td></tr>
        </table>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em>Example: <code>day == 'Saturday' OR day == 'Sunday'</code></em></p>
      </div>
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>NOT</h3>
        <p>Reverses (inverts) a True/False value.</p>
        <table style="width:100%; border-collapse: collapse; text-align: center; background: var(--card-bg); border: 1px solid var(--border);">
          <tr style="background: var(--border); font-weight: bold;"><td style="padding: 6px; border: 1px solid var(--border);">A</td><td style="padding: 6px; border: 1px solid var(--border);">NOT A</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">F</td><td style="padding: 6px; border: 1px solid var(--border);">T</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">T</td><td style="padding: 6px; border: 1px solid var(--border);">F</td></tr>
        </table>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em>Example: <code>WHILE NOT password_correct</code></em></p>
      </div>
    </div>

    <h2 class="section-title">3.2.6 Data Structures</h2>
    <p>A <strong>data structure</strong> is a way of organising several pieces of data under one name so that loops and indexes can process them efficiently.</p>
    <div class="card-grid">
      <div class="card">
        <h3>Lists (Arrays)</h3>
        <p>Lists allow you to store multiple pieces of related data (e.g., a high-score list) under one name. This is much more efficient than creating 100 separate variables.</p>
        <ul>
          <li><strong>1D list:</strong> a single row, accessed using <code>scores[0]</code>, <code>scores[1]</code>, etc.</li>
          <li><strong>2D list:</strong> a grid (rows and columns) accessed using two indices: <code>grid[row][col]</code>.</li>
          <li><strong>Pros:</strong> Makes managing large datasets easier using loops and indexing.</li>
          <li><strong>Cons:</strong> Accessing an index that doesn't exist causes an "Index Out of Bounds" error.</li>
        </ul>
        <button onclick="loadContent('act_lists')" style="margin-top: 10px; padding: 8px 15px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Lists Activity</button>
      </div>
      <div class="card">
        <h3>Records</h3>
        <p>A record groups together related fields about a single entity, e.g. a student's <code>id</code>, <code>name</code>, and <code>age</code>. Often used as the rows of a database table.</p>
        <ul>
          <li><strong>Field:</strong> one piece of data inside a record.</li>
          <li><strong>Record:</strong> a collection of fields about one item.</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title">3.2.7 Input/Output and File Handling</h2>
    <p>Programs need to communicate with the outside world. <strong>Input</strong> reads data in (keyboard or file), <strong>output</strong> sends data out (screen or file).</p>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--accent-blue);">
        <h3>Keyboard Input &amp; Screen Output</h3>
        <p>The two simplest forms of input/output use the keyboard and the screen.</p>
        <div style="background: #111; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; color: #0f0; font-size: 0.95rem;">
          name = input('Your name: ')<br>
          print('Hello, ' + name)
        </div>
        <ul style="margin-top: 10px;">
          <li><code>input()</code> always returns a <strong>string</strong> &mdash; cast with <code>int()</code> or <code>float()</code> for numbers.</li>
          <li>Always include a clear <strong>prompt</strong> so the user knows what to enter.</li>
        </ul>
      </div>
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>The Three File Modes</h3>
        <table style="width:100%; border-collapse: collapse; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
          <tr style="background: var(--border); font-weight: bold;">
            <td style="padding: 8px; border: 1px solid var(--border);">Mode</td>
            <td style="padding: 8px; border: 1px solid var(--border);">Letter</td>
            <td style="padding: 8px; border: 1px solid var(--border);">What it does</td>
          </tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Read</strong></td><td style="padding: 8px; border: 1px solid var(--border);"><code>'r'</code></td><td style="padding: 8px; border: 1px solid var(--border);">Open an existing file for reading only.</td></tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Write</strong></td><td style="padding: 8px; border: 1px solid var(--border);"><code>'w'</code></td><td style="padding: 8px; border: 1px solid var(--border);">Create a new file <strong>or overwrite</strong> an existing file.</td></tr>
          <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Append</strong></td><td style="padding: 8px; border: 1px solid var(--border);"><code>'a'</code></td><td style="padding: 8px; border: 1px solid var(--border);">Add new data to the end of an existing file.</td></tr>
        </table>
        <p style="margin-top: 10px; font-size: 0.9rem;"><strong>Always close files</strong> after use to release the lock and make sure the data is saved.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Worked Example: Save a Score</h3>
        <div style="background: #111; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; color: #0f0; font-size: 0.95rem;">
          # Append a new score on the end<br>
          file = open('scores.txt', 'a')<br>
          file.write('Sarah: 95\\n')<br>
          file.close()<br><br>
          # Read every score back<br>
          file = open('scores.txt', 'r')<br>
          for line in file:<br>
          &nbsp;&nbsp;print(line)<br>
          file.close()
        </div>
        <ul style="margin-top: 10px;">
          <li>Use <code>'a'</code> so old scores aren't lost.</li>
          <li>Use <code>'w'</code> only if you intentionally want to wipe the file first.</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title">3.2.8 String Handling Operations</h2>
    <p>Strings are sequences of characters. Programs constantly need to <strong>measure, slice, change case</strong>, and join strings together.</p>
    <div class="card-grid">
      <div class="card">
        <h3>String Manipulation</h3>
        <p>Used to format and clean text data. Common operations include:</p>
        <ul>
          <li><code>len(s)</code> &mdash; the length of the string.</li>
          <li><code>s.upper()</code> / <code>s.lower()</code> &mdash; change case (vital for case-insensitive comparisons).</li>
          <li><code>s[0]</code>, <code>s[2:5]</code> &mdash; index and slice characters.</li>
          <li><code>s1 + s2</code> &mdash; concatenation (joins two strings).</li>
        </ul>
        <ul style="margin-top: 10px;">
          <li><strong>Pros:</strong> Allows for powerful data cleaning and user-friendly display.</li>
          <li><strong>Cons:</strong> Strings are often immutable (cannot be changed), so every manipulation creates a new copy in memory.</li>
        </ul>
        <button onclick="loadContent('act_strings')" style="margin-top: 10px; padding: 8px 15px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Strings Activity</button>
      </div>
      <div class="card">
        <h3>Worked Example: Case-Insensitive Login</h3>
        <div style="background: #111; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; color: #0f0; font-size: 0.95rem;">
          stored = 'admin'<br>
          entered = input('Username: ')<br>
          IF entered.lower() == stored THEN<br>
          &nbsp;&nbsp;OUTPUT 'Welcome'<br>
          ELSE<br>
          &nbsp;&nbsp;OUTPUT 'Wrong user'<br>
          ENDIF
        </div>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em>Lowercasing both sides means "Admin" and "ADMIN" are treated the same as "admin".</em></p>
      </div>
    </div>

    <h2 class="section-title">3.2.9 Random Number Generation</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Pseudorandom Numbers</h3>
        <p>Computers can't produce truly random numbers — they use a formula and a "seed" value to produce <strong>pseudorandom</strong> numbers that look random enough for games, simulations, and choosing test data.</p>
        <ul>
          <li><strong>Use cases:</strong> dice rolls, card shuffling, password generators, picking enemies in games.</li>
          <li><strong>Inclusive range:</strong> <code>RANDOM_INT(1, 6)</code> can return 1, 2, 3, 4, 5, or 6.</li>
        </ul>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-blue);">
        <h3>Worked Example: Dice Roller</h3>
        <div style="background: #111; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; color: #0f0; font-size: 0.95rem;">
          import random<br><br>
          die1 = random.randint(1, 6)<br>
          die2 = random.randint(1, 6)<br>
          total = die1 + die2<br>
          print('You rolled', total)
        </div>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em>Each call to <code>randint(1, 6)</code> returns a fresh whole number between 1 and 6 (both ends included).</em></p>
      </div>
    </div>

    <h2 class="section-title">3.2.10 Subroutines (Procedures and Functions)</h2>
    <p>A <strong>subroutine</strong> is a named block of code that performs a specific task. They make programs <strong>modular</strong> and <strong>reusable</strong>.</p>
    <div class="card-grid">
      <div class="card">
        <h3>Procedures vs Functions</h3>
        <ul>
          <li><strong>Procedure:</strong> performs an action but does <em>not</em> return a value.</li>
          <li><strong>Function:</strong> performs a calculation and <em>returns</em> a value to the calling code.</li>
          <li><strong>Parameter:</strong> the placeholder variable in the subroutine header.</li>
          <li><strong>Argument:</strong> the actual value passed in when the subroutine is called.</li>
        </ul>
        <button onclick="loadContent('act_subroutines')" style="margin-top: 10px; padding: 8px 15px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Subroutines Activity</button>
      </div>
      <div class="card">
        <h3>Local vs Global Variables</h3>
        <p>The <strong>scope</strong> of a variable decides where in the code it can be used.</p>
        <ul>
          <li><strong>Local:</strong> declared inside a subroutine; only exists while that subroutine runs.</li>
          <li><strong>Global:</strong> declared outside all subroutines; can be read anywhere.</li>
          <li><strong>Pros of local:</strong> safer (no accidental changes from elsewhere) and easier to debug.</li>
          <li><strong>Cons of global:</strong> changes anywhere can break the program in surprising ways.</li>
        </ul>
      </div>
      <div class="card">
        <h3>Worked Example: Function with Return</h3>
        <div style="background: #111; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; color: #0f0; font-size: 0.95rem;">
          def area(width, height):<br>
          &nbsp;&nbsp;return width * height<br><br>
          a = area(5, 3)<br>
          print(a) <span style="color:#888;"># 15</span>
        </div>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em><code>width</code> and <code>height</code> are parameters; 5 and 3 are the arguments passed in.</em></p>
      </div>
    </div>

    <h2 class="section-title">3.2.11 Structured Programming</h2>
    <p>Writing programs that are well-organised, easy to read, and robust against errors. Includes <strong>defensive design</strong>, validation, and understanding the different kinds of errors.</p>
    <div class="card-grid">
      <div class="card">
        <h3>Defensive Design</h3>
        <p>Anticipates bad inputs and protects the program from crashing.</p>
        <ul>
          <li><strong>Validation:</strong> checks data is sensible (range check, length check, presence check, type check).</li>
          <li><strong>Authentication:</strong> checks the user is who they say they are (e.g. passwords).</li>
          <li><strong>Pros:</strong> Prevents program crashes and ensures only "clean" data enters the system.</li>
          <li><strong>Cons:</strong> Over-validating can make the user experience feel slow or frustrating.</li>
        </ul>
        <button onclick="loadContent('act_robust')" style="margin-top: 10px; padding: 8px 15px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Robustness Activity</button>
      </div>
      <div class="card">
        <h3>Syntax Error</h3>
        <p>A mistake in the rules of the language &mdash; a missing colon, unmatched bracket, or misspelled keyword. The program <strong>won't run at all</strong>.</p>
      </div>
      <div class="card">
        <h3>Logic Error</h3>
        <p>The program runs but produces the <strong>wrong output</strong> (e.g., using <code>+</code> when you meant <code>-</code>). Trace tables are the best way to find these.</p>
      </div>
      <div class="card">
        <h3>Runtime Error</h3>
        <p>An error that occurs <strong>while</strong> the program is running, e.g. dividing by zero or asking for a list index that doesn't exist.</p>
      </div>
    </div>

  `,

  act_io: `
    <h1>Activity: Inputs & Outputs</h1>
      <div class="homework-box">
        <h3>Task: The Level Reporter</h3>
        <p>Write a program that asks for your current level in all of your subjects, stores them in different, suitably named variables, and displays them in an organised, well-presented report on the screen.</p>
        
        <div style="margin: 20px 0; border: 2px solid var(--dark-purple); border-radius: 12px; overflow: hidden; background: #f9f9f9;">
          <div style="background: var(--brand-surface); color: white; padding: 10px; font-size: 0.9rem; font-weight: bold;">
            Python 3 Interactive Console
          </div>
          <iframe src="https://trinket.io/embed/python/3d8d7ce66b" width="100%" height="450" frameborder="0" allowfullscreen></iframe>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button onclick="document.getElementById('io-hint').style.display='block'" class="hint-btn">Give a Hint</button>
          <button onclick="document.getElementById('io-answer').style.display='block'" class="answer-btn">Show Answer</button>
        </div>

        <div id="io-hint" class="hint-box" style="display: none;">
          <strong>Hint:</strong> Start by creating variables like <code>maths_level = input("Enter Maths level: ")</code>. You will need one input line for each subject.
        </div>

        <div id="io-answer" class="answer-box" style="display: none;">
  # Possible Solution
  maths = input("Enter Maths level: ")
  english = input("Enter English level: ")
  science = input("Enter Science level: ")

  print("\\n--- Subject Report ---")
  print("Maths: " + maths)
  print("English: " + english)
  print("Science: " + science)
        </div>
      </div>
  `,

  act_casting: `
    <h1>Activity: Casting & Arithmetic</h1>
      <div class="homework-box">
        <h3>Task: Unit Converter</h3>
        <p>Write a program to input a weight in pounds and output the equivalent weight in kilograms. (Formula: kilo = pound * 0.45)</p>
        
        <div style="margin: 20px 0; border: 2px solid var(--dark-purple); border-radius: 12px; overflow: hidden; background: #f9f9f9;">
          <iframe src="https://trinket.io/embed/python/3d8d7ce66b" width="100%" height="450" frameborder="0" allowfullscreen></iframe>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button onclick="document.getElementById('cast-hint').style.display='block'" class="hint-btn">Show Hint</button>
          <button onclick="document.getElementById('cast-answer').style.display='block'" class="answer-btn">Show Answer</button>
        </div>

        <div id="cast-hint" class="hint-box" style="display: none;">
          <strong>Hint:</strong> Python treats inputs as text (strings). You must use <code>float()</code> to convert the input into a decimal number before you can multiply it.
        </div>

        <div id="cast-answer" class="answer-box" style="display: none;">
  # Possible Solution
  pounds = float(input("Enter weight in pounds: "))
  kilos = pounds * 0.45
  print("Weight in kilograms: " + str(kilos))
        </div>
      </div>
  `,

  act_selection: `
    <h1>Activity: Selection (Decisions)</h1>
      <div class="homework-box">
        <h3>Task: The Number Logic Decider</h3>
        <p>Write a program that asks the user for a number from 1-3. If it is a 1, the program will add 10 to it. If it is a 2, the program will multiply it by 10. If it is a 3, it will divide the number by 10.</p>
        
        <div style="margin: 20px 0; border: 2px solid var(--dark-purple); border-radius: 12px; overflow: hidden; background: #f9f9f9;">
          <div style="background: var(--brand-surface); color: white; padding: 10px; font-size: 0.9rem; font-weight: bold;">
            Python 3 Interactive Console
          </div>
          <iframe src="https://trinket.io/embed/python/3d8d7ce66b" width="100%" height="450" frameborder="0" allowfullscreen></iframe>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button onclick="document.getElementById('sel-hint').style.display='block'" class="hint-btn">Give a Hint</button>
          <button onclick="document.getElementById('selection-answer').style.display='block'" class="answer-btn">Show Answer</button>
        </div>

        <div id="sel-hint" class="hint-box" style="display: none;">
          <strong>Hint:</strong> Use <code>int(input())</code> to make sure the number is treated as an integer. Then use <code>if num == 1:</code> for your first condition.
        </div>

        <div id="selection-answer" class="answer-box" style="display: none;">
  # Possible Solution
  num = int(input("Enter a number (1-3): "))

  if num == 1:
      print(num + 10)
  elif num == 2:
      print(num * 10)
  elif num == 3:
      print(num / 10)
  else:
      print("Invalid choice")
        </div>
      </div>
  `,

  act_robust: `
    <h1>Activity: Defensive Design</h1>
      <div class="homework-box">
        <h3>Task: Password Length Validator</h3>
        <p>Create a program which asks the user to enter a password between 6 and 12 characters in length. The program will accept the input if it is within the correct range, but ask again (repeatedly) if it is too short or too long.</p>
        
        <div style="margin: 20px 0; border: 2px solid var(--dark-purple); border-radius: 12px; overflow: hidden; background: #f9f9f9;">
          <iframe src="https://trinket.io/embed/python/3d8d7ce66b" width="100%" height="450" frameborder="0" allowfullscreen></iframe>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button onclick="document.getElementById('robust-hint').style.display='block'" class="hint-btn">Give a Hint</button>
          <button onclick="document.getElementById('robust-answer').style.display='block'" class="answer-btn">Show Answer</button>
        </div>

        <div id="robust-hint" class="hint-box" style="display: none;">
          <strong>Hint:</strong> Use a <code>while</code> loop that checks <code>len(password)</code>. The loop should keep running as long as the length is less than 6 OR greater than 12.
        </div>

        <div id="robust-answer" class="answer-box" style="display: none;">
  # Possible Solution
  password = input("Enter a password (6-12 chars): ")

  while len(password) < 6 or len(password) > 12:
      print("Invalid length!")
      password = input("Try again: ")

  print("Password accepted.")
        </div>
      </div>
  `,

  act_loops: `
    <h1>Activity: Iteration (Loops)</h1>
      <div class="homework-box">
        <h3>Task: Square Table Generator</h3>
        <p>Write a program to display the squares of all the integers from 1 to 12 in two columns headed 'Number' and 'Square of Number'.</p>
        
        <div style="margin: 20px 0; border: 2px solid var(--dark-purple); border-radius: 12px; overflow: hidden; background: #f9f9f9;">
          <iframe src="https://trinket.io/embed/python/3d8d7ce66b" width="100%" height="450" frameborder="0" allowfullscreen></iframe>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button onclick="document.getElementById('loop-hint').style.display='block'" class="hint-btn">Give a Hint</button>
          <button onclick="document.getElementById('loop-answer').style.display='block'" class="answer-btn">Show Answer</button>
        </div>

        <div id="loop-hint" class="hint-box" style="display: none;">
          <strong>Hint:</strong> Use a <code>for</code> loop with <code>range(1, 13)</code>. Inside the loop, calculate the square by multiplying the loop variable by itself.
        </div>

        <div id="loop-answer" class="answer-box" style="display: none;">
  # Possible Solution
  print("Number\\tSquare of Number")

  for x in range(1, 13):
      square = x * x
      print(str(x) + "\\t" + str(square))
        </div>
      </div>
  `,

  act_lists: `
    <h1>Activity: 2D Lists</h1>
      <div class="homework-box">
        <h3>Task: Film Names Only</h3>
        <p>Loop through a 2D list of films and scores, but only print the film names.</p>
        
        <div style="margin: 20px 0; border: 2px solid var(--dark-purple); border-radius: 12px; overflow: hidden; background: #f9f9f9;">
          <iframe src="https://trinket.io/embed/python/3d8d7ce66b" width="100%" height="450" frameborder="0" allowfullscreen></iframe>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button onclick="document.getElementById('list-hint').style.display='block'" class="hint-btn">Show Hint</button>
          <button onclick="document.getElementById('list-answer').style.display='block'" class="answer-btn">Show Answer</button>
        </div>

        <div id="list-hint" class="hint-box" style="display: none;">
          <strong>Hint:</strong> When looping through a 2D list, each "item" in the loop is a sub-list. Access the name by using index <code>[0]</code> of that sub-list.
        </div>

        <div id="list-answer" class="answer-box" style="display: none;">
  # Possible Solution
  films = [["Matrix", 9], ["Inception", 8]]
  for film in films:
      print(film[0])
        </div>
      </div>
`,

  act_subroutines: `
    <h1>Activity: Functions & Returns</h1>
      <div class="homework-box">
        <h3>Task: The Age Calculator Function</h3>
        <p>Create a program with a function that receives the user’s age, calculates how old they will be in 50 years’ time, and then passes this data back into the main program for printing.</p>
        
        <div style="margin: 20px 0; border: 2px solid var(--dark-purple); border-radius: 12px; overflow: hidden; background: #f9f9f9;">
          <iframe src="https://trinket.io/embed/python/3d8d7ce66b" width="100%" height="450" frameborder="0" allowfullscreen></iframe>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button onclick="document.getElementById('sub-hint').style.display='block'" class="hint-btn">Give a Hint</button>
          <button onclick="document.getElementById('sub-answer').style.display='block'" class="answer-btn">Show Answer</button>
        </div>

        <div id="sub-hint" class="hint-box" style="display: none;">
          <strong>Hint:</strong> Define your function using <code>def calculate_age(current):</code>. Use the <code>return</code> keyword to send the result back to your main program.
        </div>

        <div id="sub-answer" class="answer-box" style="display: none;">
  # Possible Solution
  def calculate_future_age(current_age):
      future_age = current_age + 50
      return future_age

  # Main Program
  user_age = int(input("Enter your age: "))
  result = calculate_future_age(user_age)
  print("In 50 years you will be: " + str(result))
        </div>
      </div>
  `,

  act_strings: `
    <h1>Activity: String Manipulation</h1>
      <div class="homework-box">
        <h3>Task: Lowercase Converter</h3>
        <p>Ask for a sentence and convert all characters to lowercase.</p>
        
        <div style="margin: 20px 0; border: 2px solid var(--dark-purple); border-radius: 12px; overflow: hidden; background: #f9f9f9;">
          <iframe src="https://trinket.io/embed/python/3d8d7ce66b" width="100%" height="450" frameborder="0" allowfullscreen></iframe>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button onclick="document.getElementById('str-hint').style.display='block'" class="hint-btn">Show Hint</button>
          <button onclick="document.getElementById('str-answer').style.display='block'" class="answer-btn">Show Answer</button>
        </div>

        <div id="str-hint" class="hint-box" style="display: none;">
          <strong>Hint:</strong> Use the <code>.lower()</code> method. Example: <code>print(my_string.lower())</code>.
        </div>

        <div id="str-answer" class="answer-box" style="display: none;">
  # Possible Solution
  text = input("Enter sentence: ")
  print(text.lower())
        </div>
      </div>
  `,

  // --- 3.3 DATA REPRESENTATION (Updated) ---
  p2_data: `
    <h1>3.3 Fundamentals of Data Representation</h1>
    <p>Computers use binary to represent all forms of data because they are made of switches that can only be 'on' (1) or 'off' (0).</p>
    
    <h2 class="section-title">3.3.1 Number Bases</h2>
    <p>Computers store data using a different number system from the one we use day-to-day. You need to be able to recognise three:</p>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Denary (Base 10)</h3>
        <p>The everyday number system humans use. Has 10 digits: <strong>0&ndash;9</strong>. Each column is a power of 10 (1, 10, 100, 1000...).</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-blue);">
        <h3>Binary (Base 2)</h3>
        <p>The number system computers use internally. Has 2 digits: <strong>0 and 1</strong>. Each column is a power of 2 (1, 2, 4, 8, 16, 32...).</p>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em>Why binary? Computer hardware uses transistors that are either on or off &mdash; only two states.</em></p>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Hexadecimal (Base 16)</h3>
        <p>A shorthand for binary used by programmers. Has 16 symbols: <strong>0&ndash;9</strong> then <strong>A&ndash;F</strong> (where A=10, B=11, C=12, D=13, E=14, F=15).</p>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em>Each hex digit represents exactly 4 bits, so two hex digits = one byte.</em></p>
      </div>
    </div>

    <h2 class="section-title">3.3.2 Converting Between Number Bases</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Denary to Binary</h3>
        <p>Subtract the largest possible power of two from your number, placing a '1' in that column and a '0' if the value is too large.</p>
        <div style="font-family: monospace; font-size: 0.9rem; margin-bottom: 10px;">Example: Convert 105</div>
        <table style="width:100%; border-collapse: collapse; text-align: center; font-family: monospace; margin-bottom: 15px; background: var(--bg); border: 1px solid #dee2e6;">
          <tr style="background: var(--border); color: var(--dark-purple); font-weight: bold;">
            <td style="padding: 5px; border: 1px solid #dee2e6;">128</td>
            <td style="padding: 5px; border: 1px solid #dee2e6;">64</td>
            <td style="padding: 5px; border: 1px solid #dee2e6;">32</td>
            <td style="padding: 5px; border: 1px solid #dee2e6;">16</td>
            <td style="padding: 5px; border: 1px solid #dee2e6;">8</td>
            <td style="padding: 5px; border: 1px solid #dee2e6;">4</td>
            <td style="padding: 5px; border: 1px solid #dee2e6;">2</td>
            <td style="padding: 5px; border: 1px solid #dee2e6;">1</td>
          </tr>
          <tr style="font-size: 1.2rem;">
            <td style="padding: 8px; border: 1px solid #dee2e6;">0</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">1</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">1</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">0</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">1</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">0</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">0</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">1</td>
          </tr>
        </table>
        <p style="font-size: 0.85rem; background: rgba(245, 158, 11, 0.12); color: var(--text); padding: 10px; border-radius: 5px;">
          105 - 64 = 41<br>
          41 - 32 = 9<br>
          9 - 8 = 1<br>
          1 - 1 = 0
        </p>
      </div>

      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Binary to Denary</h3>
        <p>Place your binary digits into a power-of-two table and add the values where a '1' appears.</p>
        <table style="width:100%; border-collapse: collapse; text-align: center; font-family: monospace; margin: 15px 0; background: var(--bg); border: 1px solid #dee2e6;">
          <tr style="background: var(--border); color: var(--dark-purple); font-weight: bold;">
            <td style="padding: 8px; border: 1px solid #dee2e6;">128</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">64</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">32</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">16</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">8</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">4</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">2</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">1</td>
          </tr>
          <tr style="font-size: 1.4rem; color: var(--text);">
            <td style="padding: 12px; border: 1px solid #dee2e6;">1</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">0</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">1</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">0</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">1</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">0</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">0</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">0</td>
          </tr>
        </table>
        <div style="background: var(--info-tint); padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; font-family: 'Courier New', monospace;">
          <strong>Calculation:</strong><br>
          128 + 32 + 8 = 168
        </div>
      </div>

      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Binary to Hex</h3>
        <p>Split the byte into two nibbles (4 bits each).</p>
        <div style="background: var(--bg); color: var(--text); border: 1px solid var(--border); padding: 10px; border-radius: 5px; font-family: monospace; font-size: 0.9rem;">
          Example: 10110101<br><br>
          1. Split: [1011] [0101]<br>
          2. Convert Nibbles to Denary:<br>
          8+2+1 = 11 | 4+1 = 5<br>
          3. Convert to Hex:<br>
          11 is 'B' | 5 is '5'<br><br>
          Result: <strong>B5</strong>
        </div>
      </div>

      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Hex to Binary</h3>
        <p>Convert each Hex digit into its own 4-bit nibble, then join them together.</p>
        <div style="background: var(--bg); color: var(--text); border: 1px solid var(--border); padding: 15px; border-radius: 8px; font-family: monospace;">
          Example: <strong>3A</strong><br><br>
          1. Split: [3] [A]<br>
          2. Convert 3: 0011<br>
          3. Convert A (10): 1010<br><br>
          Result: <strong>00111010</strong>
        </div>
      </div>

      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Denary to Hex</h3>
        <p>Divide the denary number by 16.</p>
        <div style="background: var(--bg); color: var(--text); border: 1px solid var(--border); padding: 10px; border-radius: 5px; font-family: monospace; font-size: 0.9rem;">
          Example: 157<br><br>
          1. 157 / 16 = 9 (Remainder 13)<br>
          2. First digit is 9.<br>
          3. Remainder 13 is 'D'.<br><br>
          Result: <strong>9D</strong>
        </div>
      </div>

      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Hex to Denary</h3>
        <p>Multiply the left digit by 16 and add the right digit.</p>
        <div style="background: var(--info-tint); padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; font-family: 'Courier New', monospace;">
          Example: <strong>2C</strong><br><br>
          1. Left (2): 2 x 16 = 32<br>
          2. Right (C): 12<br>
          3. 32 + 12 = 44<br><br>
          Result: <strong>44</strong>
        </div>
      </div>
    </div>

    <h2 class="section-title">3.3.3 Units of Information</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Standard Units</h3>
        <ul>
          <li><strong>Bit (b):</strong> A single 0 or 1.</li>
          <li><strong>Nibble:</strong> 4 bits.</li>
          <li><strong>Byte (B):</strong> 8 bits.</li>
          <li><strong>Kilobyte (KB):</strong> 1,000 bytes.</li>
          <li><strong>Megabyte (MB):</strong> 1,000 KB.</li>
          <li><strong>Gigabyte (GB):</strong> 1,000 MB.</li>
          <li><strong>Terabyte (TB):</strong> 1,000 GB.</li>
        </ul>
      </div>
      <div class="card">
        <h3>Why Bits and Bytes?</h3>
        <p>One <strong>bit</strong> can store two states (0 or 1). Adding more bits doubles the number of possible patterns:</p>
        <ul>
          <li>1 bit &rarr; 2 patterns</li>
          <li>2 bits &rarr; 4 patterns</li>
          <li>4 bits (a nibble) &rarr; 16 patterns</li>
          <li>8 bits (a byte) &rarr; 256 patterns</li>
        </ul>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em>Every type of data &mdash; numbers, characters, images, sound &mdash; is ultimately stored as bits.</em></p>
      </div>
    </div>

    <h2 class="section-title">3.3.4 Binary Arithmetic</h2>
    <p>The CPU does all calculations in binary. The two operations you must be able to perform by hand are <strong>binary addition</strong> and <strong>binary shifts</strong>.</p>

    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--accent-blue);">
        <h3>Binary Addition Rules</h3>
        <p>There are only four rules to remember:</p>
        <ul>
          <li><code>0 + 0 = 0</code></li>
          <li><code>0 + 1 = 1</code></li>
          <li><code>1 + 1 = 10</code> &nbsp;<em>(0, carry 1)</em></li>
          <li><code>1 + 1 + 1 = 11</code> &nbsp;<em>(1, carry 1)</em></li>
        </ul>
        <h4 style="margin-top: 15px; color: var(--dark-purple);">Worked Example: 01011010 + 00110011</h4>
        <div style="background: #111; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; color: #0f0; font-size: 1rem; line-height: 1.4;">
          &nbsp;&nbsp;0 1 0 1 1 0 1 0&nbsp;&nbsp;(90)<br>
          + 0 0 1 1 0 0 1 1&nbsp;&nbsp;(51)<br>
          ---------------<br>
          &nbsp;&nbsp;1 0 0 0 1 1 0 1&nbsp;&nbsp;(141)
        </div>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em>Add column by column starting from the right, carrying any 1s into the next column to the left.</em></p>
      </div>

      <div class="card" style="border-top: 5px solid var(--accent-red);">
        <h3>Overflow Errors</h3>
        <p>An <strong>overflow</strong> happens when the result of a calculation needs more bits than the computer has set aside. In an 8-bit byte the maximum value is 255 — anything above that loses the highest bit.</p>
        <h4 style="margin-top: 15px; color: var(--dark-purple);">Worked Example: 11111110 + 00000011</h4>
        <div style="background: #111; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; color: #0f0; font-size: 1rem; line-height: 1.4;">
          &nbsp;&nbsp;1 1 1 1 1 1 1 0&nbsp;&nbsp;(254)<br>
          + 0 0 0 0 0 0 1 1&nbsp;&nbsp;(3)<br>
          ---------------<br>
          <span style="color: #ff6b6b;">1</span> 0 0 0 0 0 0 0 1&nbsp;&nbsp;(should be 257)
        </div>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em>The leftmost <strong>1</strong> can't fit in an 8-bit byte, so the stored answer is <code>00000001</code> = 1. The CPU sets an <strong>overflow flag</strong> to warn the program.</em></p>
        <ul style="margin-top: 10px;">
          <li><strong>Pros of more bits:</strong> larger numbers can be stored without overflow.</li>
          <li><strong>Cons of more bits:</strong> more memory used per number.</li>
        </ul>
      </div>
    </div>

    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--accent-yellow);">
        <h3>Logical Shift Left (&lt;&lt;)</h3>
        <p>Moves every bit one place to the left and fills the empty space on the right with a 0. Each shift left is the same as <strong>multiplying by 2</strong>.</p>
        <table style="width:100%; border-collapse: collapse; text-align: center; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
          <tr style="background: var(--border); font-weight: bold;"><td style="padding: 6px; border: 1px solid var(--border);">Step</td><td style="padding: 6px; border: 1px solid var(--border);">Binary</td><td style="padding: 6px; border: 1px solid var(--border);">Denary</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">Start</td><td style="padding: 6px; border: 1px solid var(--border);">00001100</td><td style="padding: 6px; border: 1px solid var(--border);">12</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">Shift left 1</td><td style="padding: 6px; border: 1px solid var(--border);">00011000</td><td style="padding: 6px; border: 1px solid var(--border);">24 (×2)</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">Shift left 2</td><td style="padding: 6px; border: 1px solid var(--border);">00110000</td><td style="padding: 6px; border: 1px solid var(--border);">48 (×4)</td></tr>
        </table>
      </div>

      <div class="card" style="border-top: 5px solid var(--accent-yellow);">
        <h3>Logical Shift Right (&gt;&gt;)</h3>
        <p>Moves every bit one place to the right and fills the empty space on the left with a 0. Each shift right is the same as <strong>integer division by 2</strong> (any 1s that fall off the right are lost).</p>
        <table style="width:100%; border-collapse: collapse; text-align: center; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
          <tr style="background: var(--border); font-weight: bold;"><td style="padding: 6px; border: 1px solid var(--border);">Step</td><td style="padding: 6px; border: 1px solid var(--border);">Binary</td><td style="padding: 6px; border: 1px solid var(--border);">Denary</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">Start</td><td style="padding: 6px; border: 1px solid var(--border);">00011000</td><td style="padding: 6px; border: 1px solid var(--border);">24</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">Shift right 1</td><td style="padding: 6px; border: 1px solid var(--border);">00001100</td><td style="padding: 6px; border: 1px solid var(--border);">12 (÷2)</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">Shift right 2</td><td style="padding: 6px; border: 1px solid var(--border);">00000110</td><td style="padding: 6px; border: 1px solid var(--border);">6 (÷4)</td></tr>
        </table>
      </div>
    </div>

    <h2 class="section-title">3.3.5 Character Encoding</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>ASCII</h3>
        <p>The American Standard Code for Information Interchange.</p>
        <ul>
          <li><strong>Standard ASCII:</strong> Uses 7 bits to represent 128 characters (codes 0 to 127).</li>
          <li><strong>Extended ASCII:</strong> Uses 8 bits (1 byte) to represent 256 characters.</li>
          <li><strong>Limitation:</strong> It cannot represent characters from non-English languages.</li>
        </ul>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Unicode</h3>
        <p>Developed to solve the limitations of ASCII by using 16 or 32 bits.</p>
        <ul>
          <li>Can represent every character in every language globally.</li>
          <li>Includes room for symbols and emojis.</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title">3.3.6 Representing Images</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Bitmap Images</h3>
        <p>Images made of rows of dots called <strong>pixels</strong>.</p>
        <ul>
          <li><strong>Resolution:</strong> The number of pixels in a space (e.g., DPI). Higher resolution means more detail but larger file size.</li>
          <li><strong>Colour Depth:</strong> The number of bits per pixel. More bits allow for a greater range of colours, making images look more real.</li>
          <li><strong>Metadata:</strong> Extra data stored about the image such as date, dimensions, and camera settings.</li>
        </ul>
      </div>
      <div class="card" style="border-top: 5px solid #007bff;">
        <h3>Image File Size Calculation</h3>
        <p>The total number of bits in an image is calculated by multiplying dimensions by the colour depth.</p>
        <div style="background: var(--bg); padding: 15px; border-radius: 8px; border: 1px solid #dee2e6; font-family: monospace;">
          <strong>Example:</strong> A 100 x 100 pixel image with a 8-bit colour depth.<br><br>
          1. <strong>Total Pixels:</strong> 100 x 100 = 10,000 pixels<br>
          2. <strong>Total Bits:</strong> 10,000 x 8 = 80,000 bits<br>
          3. <strong>In Bytes:</strong> 80,000 / 8 = 10,000 bytes<br><br>
          <strong>Formula:</strong> Width x Height x Colour Depth
        </div>
      </div>
    </div>

    <h2 class="section-title">3.3.7 Representing Sound</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Digital Sound</h3>
        <p>Sound is digitised by <strong>sampling</strong> the amplitude of analogue waves at set intervals.</p>
        <ul>
          <li><strong>Sample Rate:</strong> Number of samples per second (Hz). Higher rates reduce gaps between recordings.</li>
          <li><strong>Bit Depth:</strong> Number of bits used per sample. Higher bit depth improves quality by recording more data per sample.</li>
          <li><strong>Trade-off:</strong> Higher rate or depth = better quality, but also a larger file.</li>
        </ul>
      </div>
      <div class="card" style="border-top: 5px solid #28a745;">
        <h3>Sound File Size Calculation</h3>
        <p>Calculated by multiplying the sample rate, bit depth, and duration in seconds.</p>
        <div style="background: var(--bg); padding: 15px; border-radius: 8px; border: 1px solid #dee2e6; font-family: monospace;">
          <strong>Example:</strong> 10s of audio, 44,100Hz sample rate, 16-bit depth.<br><br>
          1. <strong>Calculation:</strong> 44,100 x 16 x 10<br>
          2. <strong>Total Bits:</strong> 7,056,000 bits<br>
          3. <strong>In MB:</strong> approx 0.88 MB<br><br>
          <strong>Formula:</strong> Rate x Depth x Time
        </div>
      </div>
    </div>

    <h2 class="section-title">3.3.8 Data Compression</h2>
    <div class="homework-box">
      <p>Different file formats are designed for specific tasks. Lossy is best for streaming and web use, while Lossless is essential for documents where every bit must be preserved.</p>
      <table style="width:100%; border-collapse: collapse; margin-top: 20px; color: white; background: #222; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: var(--brand-surface); text-align: left;">
            <th style="padding: 12px; border: 1px solid #444;">Data Type</th>
            <th style="padding: 12px; border: 1px solid #444;">Lossy Format</th>
            <th style="padding: 12px; border: 1px solid #444;">Lossless Format</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border: 1px solid #444;"><strong>Images</strong></td>
            <td style="padding: 12px; border: 1px solid #444;">JPEG (.jpg)</td>
            <td style="padding: 12px; border: 1px solid #444;">PNG (.png) or GIF</td>
          </tr>
          <tr style="background: #2a2a2a;">
            <td style="padding: 12px; border: 1px solid #444;"><strong>Sound</strong></td>
            <td style="padding: 12px; border: 1px solid #444;">MP3</td>
            <td style="padding: 12px; border: 1px solid #444;">WAV or FLAC</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #444;"><strong>Video</strong></td>
            <td style="padding: 12px; border: 1px solid #444;">MP4</td>
            <td style="padding: 12px; border: 1px solid #444;">MKV (Lossless preset)</td>
          </tr>
          <tr style="background: #2a2a2a;">
            <td style="padding: 12px; border: 1px solid #444;"><strong>Documents</strong></td>
            <td style="padding: 12px; border: 1px solid #444;">N/A (Would break file)</td>
            <td style="padding: 12px; border: 1px solid #444;">ZIP / PDF</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Run-Length Encoding (RLE)</h3>
        <p>A form of lossless compression that replaces consecutive identical data elements with a single data value and a count.</p>
        <button onclick="loadContent('p2_rle_act')" style="margin-top: 10px; padding: 8px 15px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Try RLE Activity</button>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Huffman Encoding</h3>
        <p>Uses a frequency-based tree to assign shorter binary codes to more frequent characters, reducing the overall file size.</p>
        <button onclick="loadContent('p2_huffman_act')" style="margin-top: 10px; padding: 8px 15px; background: var(--accent-green-strong); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Huffman Activity</button>
      </div>
    </div>

    <h2 class="section-title">Key Definitions</h2>
    <div class="card-grid">
      <div class="card"><h3>Bit</h3><p>A single binary digit, 0 or 1. The smallest unit of digital data.</p></div>
      <div class="card"><h3>Byte</h3><p>A group of 8 bits. Used to represent one character of text in basic ASCII.</p></div>
      <div class="card"><h3>Pixel</h3><p>The smallest single point of colour in a bitmap image (short for "picture element").</p></div>
      <div class="card"><h3>Sample</h3><p>One measurement of a sound wave's amplitude taken at a single point in time.</p></div>
      <div class="card"><h3>Compression</h3><p>Reducing the file size of data so it takes up less storage and transfers faster.</p></div>
      <div class="card"><h3>Lossy vs Lossless</h3><p><strong>Lossy</strong> permanently removes data the user is unlikely to notice (smaller files, lower quality). <strong>Lossless</strong> rebuilds the original perfectly.</p></div>
    </div>

  `,

  p2_rle_act: `
    <h1>RLE Compression Activity</h1>
    <p>Enter a string with repeated characters (e.g., "AAAABBBCC") to see how RLE compresses it.</p>
    
    <div style="background: #111; padding: 40px; border-radius: 12px; margin: 20px 0; text-align: center;">
      <input type="text" id="rle-input" placeholder="Enter text here..." style="padding: 10px; width: 80%; border-radius: 5px; border: none; margin-bottom: 20px;">
      <div id="rle-result" style="color: #fff; font-family: monospace; font-size: 1.5rem; min-height: 40px;"></div>
      <button onclick="runRLE()" style="margin-top: 20px; padding: 10px 25px; background: var(--accent-green-strong); color: white; border: none; border-radius: 5px; cursor: pointer;">Compress Now</button>
    </div>

    <div class="homework-box">
      <h3>Exam Tip</h3>
      <p>RLE works best on data with long runs of repeated values, like simple icons or indented code.</p>
    </div>
  `,

  p2_huffman_act: `
  <h1>Full Huffman Tree Challenge</h1>
  <p>Build the tree for <strong>"BANNED"</strong>. Frequencies: <strong>N:2, B:1, A:1, E:1, D:1</strong>. Total = 6.</p>
  <p>Fill in each node's total, then place the four letters that appear once in the bottom row.</p>
  
  <div style="background: #111; padding: 40px; border-radius: 12px; margin: 20px 0; text-align: center; color: white; overflow-x: auto;">
    <div class="tree-wrapper" style="position: relative; width: 800px; margin: 0 auto; height: 430px;">

      <div style="position: absolute; left: 375px; top: 0px; z-index: 2;">
        <input type="text" id="node-sum-6" placeholder="Sum" aria-label="Sum" style="width: 55px; height: 55px; text-align: center; border-radius: 50%; background: #222; color: white; border: 2px solid #888;">
      </div>

      <div style="position: absolute; left: 200px; top: 120px; z-index: 2;">
        <div style="width: 55px; height: 55px; background: var(--accent-green); border-radius: 8px; line-height: 55px; font-weight: bold;">N</div>
      </div>
      <div style="position: absolute; left: 550px; top: 120px; z-index: 2;">
        <input type="text" id="node-sum-4" placeholder="Sum" aria-label="Sum" style="width: 55px; height: 55px; text-align: center; border-radius: 50%; background: #222; color: white; border: 2px solid #888;">
      </div>

      <div style="position: absolute; left: 425px; top: 240px; z-index: 2;">
        <input type="text" id="node-sum-2a" placeholder="Sum" aria-label="Sum" style="width: 55px; height: 55px; text-align: center; border-radius: 50%; background: #222; color: white; border: 2px solid #888;">
      </div>
      <div style="position: absolute; left: 675px; top: 240px; z-index: 2;">
        <input type="text" id="node-sum-2b" placeholder="Sum" aria-label="Sum" style="width: 55px; height: 55px; text-align: center; border-radius: 50%; background: #222; color: white; border: 2px solid #888;">
      </div>

      <div style="position: absolute; left: 360px; top: 360px; z-index: 2;">
        <input type="text" id="node-leaf-1" placeholder="Ltr" aria-label="Letter" maxlength="1" style="width: 50px; height: 50px; text-align: center; background: #444; color: white; border-radius: 4px; border: 1px solid #888;">
      </div>
      <div style="position: absolute; left: 480px; top: 360px; z-index: 2;">
        <input type="text" id="node-leaf-2" placeholder="Ltr" aria-label="Letter" maxlength="1" style="width: 50px; height: 50px; text-align: center; background: #444; color: white; border-radius: 4px; border: 1px solid #888;">
      </div>
      <div style="position: absolute; left: 610px; top: 360px; z-index: 2;">
        <input type="text" id="node-leaf-3" placeholder="Ltr" aria-label="Letter" maxlength="1" style="width: 50px; height: 50px; text-align: center; background: #444; color: white; border-radius: 4px; border: 1px solid #888;">
      </div>
      <div style="position: absolute; left: 730px; top: 360px; z-index: 2;">
        <input type="text" id="node-leaf-4" placeholder="Ltr" aria-label="Letter" maxlength="1" style="width: 50px; height: 50px; text-align: center; background: #444; color: white; border-radius: 4px; border: 1px solid #888;">
      </div>

      <svg style="position: absolute; top: 0; left: 0; width: 800px; height: 100%; pointer-events: none;">
        <line x1="402" y1="55" x2="227" y2="120" stroke="#666" stroke-width="2" /> <line x1="402" y1="55" x2="577" y2="120" stroke="#666" stroke-width="2" /> <line x1="577" y1="175" x2="452" y2="240" stroke="#666" stroke-width="2" /> <line x1="577" y1="175" x2="702" y2="240" stroke="#666" stroke-width="2" /> <line x1="452" y1="295" x2="385" y2="360" stroke="#666" stroke-width="2" /> <line x1="452" y1="295" x2="505" y2="360" stroke="#666" stroke-width="2" /> <line x1="702" y1="295" x2="635" y2="360" stroke="#666" stroke-width="2" /> <line x1="702" y1="295" x2="755" y2="360" stroke="#666" stroke-width="2" />
      </svg>
    </div>

    <div id="huff-feedback" style="margin-top: 40px; min-height: 24px; font-weight: bold;"></div>
    
    <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
      <button onclick="checkFullHuffman()" style="padding: 12px 30px; background: var(--accent-green-strong); color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Verify Tree Logic</button>
      <button onclick="loadContent('p2_huffman_act')" style="padding: 12px 30px; background: #444; color: white; border: none; border-radius: 5px; cursor: pointer;">Reset Tree</button>
    </div>
  </div>
  
`,

  // --- 3.4 SYSTEMS (Updated Dynamic Layout) ---
  p2_sys: `
    <h1>3.4 Computer Systems</h1>
    <p>This unit covers how hardware components work together and the essential software that manages them.</p>

    <h2 class="section-title">3.4.1 Hardware and Software</h2>
    <p>Every computer system has two parts: the physical things you can touch (hardware) and the instructions that tell them what to do (software).</p>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Hardware</h3>
        <p>The physical, electronic components of a computer system.</p>
        <ul>
          <li><strong>Internal:</strong> CPU, RAM, motherboard, hard drive, power supply.</li>
          <li><strong>External / peripherals:</strong> keyboard, mouse, monitor, printer.</li>
        </ul>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Software</h3>
        <p>Programs and instructions that run on the hardware.</p>
        <ul>
          <li><strong>System software:</strong> operating system, utility software, drivers, translators.</li>
          <li><strong>Application software:</strong> what users run to do tasks &mdash; web browsers, word processors, games.</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title">3.4.2 Boolean Logic</h2>
    <p>The CPU is built from millions of <strong>logic gates</strong>. Each gate takes one or two binary inputs and produces a single binary output. You must be able to recognise the symbols and complete a truth table for each.</p>

    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>NOT Gate (Inverter)</h3>
        <p>One input, one output. Flips a 0 to a 1 and vice-versa.</p>
        <table style="width:100%; border-collapse: collapse; text-align: center; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
          <tr style="background: var(--border); font-weight: bold;"><td style="padding: 6px; border: 1px solid var(--border);">A</td><td style="padding: 6px; border: 1px solid var(--border);">NOT A</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">0</td><td style="padding: 6px; border: 1px solid var(--border);">1</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">1</td><td style="padding: 6px; border: 1px solid var(--border);">0</td></tr>
        </table>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em>Symbol: triangle with a small circle on the output.</em></p>
      </div>

      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>AND Gate</h3>
        <p>Two inputs, one output. Output is 1 only when <strong>both</strong> inputs are 1.</p>
        <table style="width:100%; border-collapse: collapse; text-align: center; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
          <tr style="background: var(--border); font-weight: bold;"><td style="padding: 6px; border: 1px solid var(--border);">A</td><td style="padding: 6px; border: 1px solid var(--border);">B</td><td style="padding: 6px; border: 1px solid var(--border);">A AND B</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">0</td><td style="padding: 6px; border: 1px solid var(--border);">0</td><td style="padding: 6px; border: 1px solid var(--border);">0</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">0</td><td style="padding: 6px; border: 1px solid var(--border);">1</td><td style="padding: 6px; border: 1px solid var(--border);">0</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">1</td><td style="padding: 6px; border: 1px solid var(--border);">0</td><td style="padding: 6px; border: 1px solid var(--border);">0</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">1</td><td style="padding: 6px; border: 1px solid var(--border);">1</td><td style="padding: 6px; border: 1px solid var(--border);">1</td></tr>
        </table>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em>Symbol: D-shape with a flat back.</em></p>
      </div>

      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>OR Gate</h3>
        <p>Two inputs, one output. Output is 1 when <strong>at least one</strong> input is 1.</p>
        <table style="width:100%; border-collapse: collapse; text-align: center; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
          <tr style="background: var(--border); font-weight: bold;"><td style="padding: 6px; border: 1px solid var(--border);">A</td><td style="padding: 6px; border: 1px solid var(--border);">B</td><td style="padding: 6px; border: 1px solid var(--border);">A OR B</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">0</td><td style="padding: 6px; border: 1px solid var(--border);">0</td><td style="padding: 6px; border: 1px solid var(--border);">0</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">0</td><td style="padding: 6px; border: 1px solid var(--border);">1</td><td style="padding: 6px; border: 1px solid var(--border);">1</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">1</td><td style="padding: 6px; border: 1px solid var(--border);">0</td><td style="padding: 6px; border: 1px solid var(--border);">1</td></tr>
          <tr><td style="padding: 6px; border: 1px solid var(--border);">1</td><td style="padding: 6px; border: 1px solid var(--border);">1</td><td style="padding: 6px; border: 1px solid var(--border);">1</td></tr>
        </table>
        <p style="margin-top: 10px; font-size: 0.9rem;"><em>Symbol: curved back with a pointed output (rocket-shaped).</em></p>
      </div>
    </div>

    <div class="homework-box" style="margin-top: 20px;">
      <h3>Combined Logic: Worked Example</h3>
      <p>Calculate the output Q for the expression <code>Q = (A AND B) OR (NOT C)</code> when A=1, B=0, C=1.</p>
      <ol>
        <li><code>A AND B</code> &rarr; <code>1 AND 0</code> = <strong>0</strong></li>
        <li><code>NOT C</code> &rarr; <code>NOT 1</code> = <strong>0</strong></li>
        <li><code>0 OR 0</code> = <strong>0</strong></li>
      </ol>
      <p style="margin-top: 10px;"><strong>Final answer: Q = 0.</strong></p>
      <p style="margin-top: 10px; font-size: 0.9rem;"><em>Tip: in the exam, build a truth table with one column per intermediate step so you don't lose track.</em></p>
    </div>

    <h2 class="section-title">3.4.3 Software Classification</h2>
    <p>Software falls into two main groups: <strong>system software</strong> manages the computer itself, while <strong>application software</strong> performs useful tasks for the user. Programming languages and translators are also part of system software.</p>

    <h3 style="margin-top: 20px; color: var(--dark-purple);">System Software</h3>
    <div class="card-grid" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">
      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column; border-top: 5px solid var(--dark-purple);">
        <h3>Operating System (OS)</h3>
        <p>Software that manages the hardware and lets applications run. Examples: Windows, macOS, Linux, Android, iOS.</p>
        <ul style="flex-grow: 1;">
          <li><strong>Memory management</strong> &mdash; decides which programs go in RAM.</li>
          <li><strong>Processor management</strong> &mdash; schedules CPU time between tasks.</li>
          <li><strong>Peripheral management</strong> &mdash; controls keyboards, printers, etc. via device drivers.</li>
          <li><strong>User interface (UI)</strong> &mdash; lets users interact (GUI or CLI).</li>
          <li><strong>User & file management</strong> &mdash; logins, permissions, organising files.</li>
        </ul>
      </div>
      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column; border-top: 5px solid var(--accent-green);">
        <h3>Utility Software</h3>
        <p>Specialised programs that help maintain or protect the computer.</p>
        <ul style="flex-grow: 1;">
          <li><strong>Anti-virus / anti-malware</strong> &mdash; detects and removes malicious software.</li>
          <li><strong>Backup software</strong> &mdash; creates copies of important files in case of loss.</li>
          <li><strong>Disk defragmentation</strong> &mdash; tidies up scattered file pieces on a hard drive to speed it up.</li>
          <li><strong>File compression</strong> &mdash; reduces file sizes for storage or transfer (e.g. ZIP).</li>
          <li><strong>Encryption</strong> &mdash; scrambles files so only authorised users can read them.</li>
        </ul>
      </div>
      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column; border-top: 5px solid var(--accent-blue);">
        <h3>Embedded Systems</h3>
        <p>A computer system built into another device to perform a single specific task. Examples: washing machines, microwaves, traffic lights, smart thermostats.</p>
        <ul style="flex-grow: 1;">
          <li>Cheap to make and very reliable.</li>
          <li>Software is usually held in ROM and rarely updated.</li>
          <li>Use very little power compared to a general-purpose PC.</li>
        </ul>
      </div>
    </div>

    <h3 style="margin-top: 30px; color: var(--dark-purple);">Programming Languages</h3>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid #007bff;">
        <h3>High-Level Languages</h3>
        <p>Languages designed to be easily understood by humans, such as Python, Java, or C++.</p>
        <ul>
          <li><strong>Definition:</strong> Uses English-like keywords and structure.</li>
          <li><strong>Advantages:</strong> Faster to write, easier to debug, and portable (can run on different CPU architectures).</li>
          <li><strong>Disadvantages:</strong> Must be translated before execution; slower to run and less memory efficient than low-level code.</li>
        </ul>
      </div>

      <div class="card" style="border-top: 5px solid #dc3545;">
        <h3>Low-Level Languages</h3>
        <p>Languages that sit close to the computer's hardware, such as Assembly or Machine Code.</p>
        <ul>
          <li><strong>Definition:</strong> Refers directly to the specific architecture and hardware of a particular CPU.</li>
          <li><strong>Advantages:</strong> Can be executed faster and allows for direct manipulation of hardware and memory.</li>
          <li><strong>Disadvantages:</strong> Very difficult for humans to read/write, hard to debug, and specific to one type of machine (not portable).</li>
        </ul>
      </div>
    </div>

    <div class="homework-box" style="margin-top: 30px;">
      <h3>Comparison: High vs. Low Level</h3>
      <table style="width:100%; border-collapse: collapse; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
        <tr style="background: var(--bg); font-weight: bold;">
          <td style="padding: 10px; border: 1px solid #ddd;">Feature</td>
          <td style="padding: 10px; border: 1px solid #ddd;">High-Level</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Low-Level</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Ease of Use</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">High (English-like)</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Low (Cryptic/Binary)</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Translation</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">Required (Compiler/Interpreter)</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Minimal (Assembler/None)</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Portability</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">Portable across machines</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Machine-specific</td>
        </tr>
      </table>
    </div>

    <h3 style="margin-top: 30px; color: var(--dark-purple);">Translators</h3>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--accent-green); flex: 1 1 100%;">
        <h3>How Code is Converted</h3>
        <p>Computers can only execute <strong>Machine Code</strong> (binary). Translators convert source code into this executable format.</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); gap: 20px; margin-top: 15px;">
          <div style="background: var(--bg); padding: 15px; border-radius: 8px;">
            <h4>Compiler</h4>
            <p>Translates the <strong>entire</strong> source code at once into an executable file.</p>
            <ul>
              <li><strong>Execution:</strong> Very fast as translation is already done.</li>
              <li><strong>Security:</strong> Source code is hidden from the user.</li>
              <li><strong>Error Handling:</strong> Reports all errors only after trying to compile the whole program.</li>
            </ul>
          </div>

          <div style="background: var(--bg); padding: 15px; border-radius: 8px;">
            <h4>Interpreter</h4>
            <p>Translates and executes code <strong>line-by-line</strong>.</p>
            <ul>
              <li><strong>Execution:</strong> Slower because translation happens while the program runs.</li>
              <li><strong>Debugging:</strong> Program stops at the first error, making it easy to find.</li>
              <li><strong>Environment:</strong> Requires the interpreter software to be installed on the target machine.</li>
            </ul>
          </div>

          <div style="background: var(--bg); padding: 15px; border-radius: 8px;">
            <h4>Assembler</h4>
            <p>Converts <strong>Assembly Language</strong> into machine code.</p>
            <ul>
              <li><strong>Mapping:</strong> Direct 1-to-1 translation between mnemonics and binary.</li>
              <li><strong>Efficiency:</strong> Produces very optimized code for specific hardware.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <h3 style="margin-top: 40px; color: var(--dark-purple);">Translator Matching Game</h3>
    <p>Drag the language or feature to the correct translator.</p>

    <div class="homework-box">
      <div id="role-bank" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; padding: 15px; background: var(--bg); border-radius: 8px; min-height: 50px;">
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="match-python" data-phase="interp">Python</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="match-assembly" data-phase="assembler">Assembly</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="match-cpp" data-phase="comp">C++</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="match-lbl" data-phase="interp">Line-by-Line</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="match-exec" data-phase="comp">Creates .exe file</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="match-mnem" data-phase="assembler">Mnemonics</div>
      </div>

      <div class="card-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" id="comp">
          <h3>Compiler</h3>
        </div>
        <div class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" id="interp">
          <h3>Interpreter</h3>
        </div>
        <div class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" id="assembler">
          <h3>Assembler</h3>
        </div>
      </div>

      <div id="game-feedback" style="margin-top: 20px; font-weight: bold; min-height: 24px; text-align: center;"></div>

      <div style="display:flex; justify-content: center; gap: 10px; margin-top: 20px;">
        <button onclick="loadContent('p2_sys')" style="padding: 10px 20px; background: var(--pastel-violet); color: var(--dark-purple); font-weight: bold; border: none; border-radius: 5px; cursor: pointer;">Reset Game</button>
      </div>
    </div>

    <h2 class="section-title">3.4.4 Systems Architecture</h2>
    <p>How the CPU is built, how it executes instructions, and how main memory and storage support it.</p>

    <div class="card-grid" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">

      <div class="card spec-removed" style="flex: 1 1 100%; min-height: auto;">
        <span class="spec-badge">Not examined from 2027</span>
        <h3 style="text-align: center;">Von Neumann Architecture</h3>
        <!-- Frame stays white in both themes because the JPG has a white
             background; its caption therefore needs a fixed dark colour rather
             than the theme token, which goes pale in dark mode. -->
        <div style="background: white; color: #334155; padding: 10px; border-radius: 8px; text-align: center;">
          <img src="./Von-Neumann-Architecture-Diagram.jpg" alt="Von Neumann CPU Diagram" style="max-width: 100%; height: auto; border-radius: 5px;">
          <p style="font-size: 0.9rem; color: #475569; margin-top: 10px;">Instructions and data share the same memory. The CPU fetches them one at a time.</p>
        </div>
        <span class="spec-removed-why">AQA removed the Von Neumann architecture by name for exams from summer 2027. It is kept here because it is the clearest way to picture the fetch&ndash;decode&ndash;execute cycle and the CPU components below, both of which <strong>are</strong> still examined.</span>
      </div>

      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <div class="card-image">CPU</div>
        <h3>The CPU Components</h3>
        <p>The CPU uses binary logic to make decisions based on inputs.</p>
        <ul style="flex-grow: 1;">
          <li><strong>CU (Control Unit):</strong> Decodes instructions and controls data flow.</li>
          <li><strong>ALU (Arithmetic Logic Unit):</strong> Performs calculations and logic operations like AND, OR, and NOT.</li>
          <li><strong>Cache:</strong> High-speed memory for frequently used data.</li>
          <li><strong>Logic Gates:</strong> Millions of components (AND, OR, NOT) that make up the CPU.</li>
        </ul>
      </div>

      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <div class="card-image">REG</div>
        <h3>Registers</h3>
        <p>Extremely fast storage locations within the CPU:</p>
        <ul style="flex-grow: 1;">
          <li><strong>PC (Program Counter):</strong> Holds the address of the next instruction.</li>
          <li><strong>MAR:</strong> Memory Address Register for the current memory location.</li>
          <li><strong>MDR:</strong> Memory Data Register for actual data or instructions.</li>
          <li><strong>ACC (Accumulator):</strong> Stores results of ALU logic operations.</li>
        </ul>
      </div>
    </div>

    <div class="homework-box" style="margin-top: 30px;">
      <h3>The Fetch-Decode-Execute Cycle</h3>
      <p>The continuous process a CPU follows to process instructions:</p>
      <ol>
        <li><strong>Fetch:</strong> The instruction is retrieved from memory (RAM) to the CPU.</li>
        <li><strong>Decode:</strong> The Control Unit (CU) works out what the instruction is.</li>
        <li><strong>Execute:</strong> The instruction is carried out by the ALU or other components.</li>
      </ol>
    </div>

    <h3 style="margin-top: 30px; color: var(--dark-purple);">Memory</h3>
    <div class="card-grid" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">
      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <h3>RAM (Random Access Memory)</h3>
        <p>Main memory used while the computer is running.</p>
        <ul style="flex-grow: 1;">
          <li><strong>Volatile</strong> &mdash; loses contents when power is off.</li>
          <li>Holds the operating system, open programs, and the data they use.</li>
          <li>Can be read from <strong>and</strong> written to.</li>
        </ul>
      </div>
      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <h3>ROM (Read-Only Memory)</h3>
        <p>Permanent memory the CPU uses at start-up.</p>
        <ul style="flex-grow: 1;">
          <li><strong>Non-volatile</strong> &mdash; keeps contents without power.</li>
          <li>Holds the <strong>BIOS / boot loader</strong>.</li>
          <li>Read-only in normal use.</li>
        </ul>
      </div>
      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <h3>Virtual Memory</h3>
        <p>If RAM fills up, the OS uses part of the hard drive as "extra" RAM by swapping data in and out. It stops the program from crashing but is much slower than real RAM.</p>
      </div>
    </div>

    <h3 style="margin-top: 30px; color: var(--dark-purple);">Secondary Storage Types</h3>
    <table style="width:100%; border-collapse: collapse; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
      <tr style="background: var(--brand-surface); color: white; font-weight: bold;">
        <td style="padding: 10px; border: 1px solid var(--border);">Type</td>
        <td style="padding: 10px; border: 1px solid var(--border);">Examples</td>
        <td style="padding: 10px; border: 1px solid var(--border);">Pros</td>
        <td style="padding: 10px; border: 1px solid var(--border);">Cons</td>
      </tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Magnetic</strong></td><td style="padding: 8px; border: 1px solid var(--border);">HDD, magnetic tape</td><td style="padding: 8px; border: 1px solid var(--border);">Cheap per GB, very large capacity</td><td style="padding: 8px; border: 1px solid var(--border);">Slow, fragile (moving parts)</td></tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Optical</strong> <span class="spec-badge">Not examined from 2027</span></td><td style="padding: 8px; border: 1px solid var(--border);">CD, DVD, Blu-ray</td><td style="padding: 8px; border: 1px solid var(--border);">Cheap, portable, good for distribution</td><td style="padding: 8px; border: 1px solid var(--border);">Small capacity, easily scratched</td></tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Solid State (Flash)</strong></td><td style="padding: 8px; border: 1px solid var(--border);">SSD, USB stick, SD card</td><td style="padding: 8px; border: 1px solid var(--border);">Very fast, silent, robust (no moving parts)</td><td style="padding: 8px; border: 1px solid var(--border);">More expensive per GB; limited write cycles</td></tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Cloud</strong></td><td style="padding: 8px; border: 1px solid var(--border);">Google Drive, OneDrive, iCloud, Dropbox</td><td style="padding: 8px; border: 1px solid var(--border);">Access from any device, easy sharing, provider handles backups, scale capacity up or down</td><td style="padding: 8px; border: 1px solid var(--border);">Needs an internet connection; ongoing subscription cost; you rely on the provider for security and privacy</td></tr>
    </table>
    <p style="margin-top: 10px;">Cloud storage is not a new kind of hardware: your files sit on <strong>magnetic and solid state drives</strong> in a provider's data centre, and you reach them <strong>over the internet</strong>.</p>

  `,

  // --- 3.5 COMPUTER NETWORKS (Updated with Workbook Data) ---
  p2_net: `
    <h1>3.5 Computer Networks</h1>
    <p>A computer network is defined as two or more computers connected together to share information and resources.</p>

    <h2 class="section-title">3.5.1 Network Types</h2>
    <div class="card-grid" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">
      <div class="card" style="flex: 1 1 100%; display: flex; flex-direction: column;">
        <h3>PAN, LAN and WAN</h3>
        <ul style="flex-grow: 1;">
          <li><strong>PAN (Personal Area Network):</strong> Covers a very short range (few metres) for personal devices like Bluetooth headphones.</li>
          <li><strong>LAN (Local Area Network):</strong> Covers a small geographical area. Infrastructure is typically organisation-owned.</li>
          <li><strong>WAN (Wide Area Network):</strong> Covers a large or worldwide area using 3rd party infrastructure like satellites.</li>
        </ul>
      </div>
    </div>

    <!-- Collapsed by default, like the dashboard notice: this is background a
         2027 candidate is not examined on, so it should not push the examinable
         sections below it off the screen. -->
    <details class="spec-removed spec-disclosure">
      <summary class="spec-summary">
        <span class="spec-badge">Not examined from 2027</span>
        <h2 class="spec-summary-title">Network Topologies</h2>
        <svg class="spec-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
          aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div class="spec-disclosure-body">
    <p style="margin-top:0;">AQA removed LAN topologies for exams from summer 2027, so you will not be asked about these. Star and bus are kept below as background, because they are still a useful way to think about how a network is wired.</p>
    <p style="margin-top:0;"><strong>Ring and mesh topologies have been taken off this page.</strong> They were never part of AQA 8525 &mdash; they belong to other exam boards &mdash; so revising them was wasted effort even before the 2027 changes.</p>
    <div class="card-grid">
      <div class="card">
        <h3>The Two AQA Topologies</h3>
        <p>Devices on a network are known as <strong>nodes</strong>.</p>
        <ul>
          <li><strong>Star:</strong> All nodes connect to a central switch. Easy to add devices but relies on the central node.</li>
          <li><strong>Bus:</strong> All nodes connect to a single backbone cable. Cheap to install but a cable break ruins the whole network.</li>
        </ul>
      </div>
    </div>

    <h3 style="margin-top: 20px; color: var(--dark-purple);">Topology Pros &amp; Cons</h3>
    <table style="width:100%; border-collapse: collapse; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
      <tr style="background: var(--brand-surface); color: white; font-weight: bold;">
        <td style="padding: 10px; border: 1px solid var(--border);">Topology</td>
        <td style="padding: 10px; border: 1px solid var(--border);">Advantages</td>
        <td style="padding: 10px; border: 1px solid var(--border);">Disadvantages</td>
      </tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Star</strong></td><td style="padding: 8px; border: 1px solid var(--border);">Easy to add/remove devices; one cable fault doesn't bring down the rest</td><td style="padding: 8px; border: 1px solid var(--border);">Whole network depends on the central switch; lots of cabling</td></tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Bus</strong></td><td style="padding: 8px; border: 1px solid var(--border);">Cheap and simple to install</td><td style="padding: 8px; border: 1px solid var(--border);">If the backbone breaks, the entire network fails; slow with many devices (collisions)</td></tr>
    </table>
      </div>
    </details>

    <h2 class="section-title">3.5.3 Network Hardware</h2>
    <p>Different devices play different roles on a network. Don't confuse them &mdash; exam questions love to test the difference between a switch and a hub.</p>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Switch</h3>
        <p>Connects devices on a LAN. Reads the destination MAC address on each packet and sends it <strong>only</strong> to the target device. Used in star networks.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Router</h3>
        <p>Connects different networks together (e.g. your home LAN to the internet). Reads <strong>IP addresses</strong> and chooses the best route for each packet.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Wireless Access Point (WAP)</h3>
        <p>Allows wireless devices (Wi-Fi) to join a wired network by converting between radio waves and electrical signals.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Network Interface Card (NIC)</h3>
        <p>The hardware inside a computer (or built into the motherboard) that lets it connect to a network. Has a unique <strong>MAC address</strong> fixed at the factory.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Hub</h3>
        <p>An older device that sends every packet to <strong>every</strong> connected device, regardless of destination. Inefficient and a security risk &mdash; switches have largely replaced them.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Transmission Media</h3>
        <p><strong>Copper cable</strong> (ethernet) is cheap and easy to install. <strong>Fibre-optic</strong> cable carries data as light, giving very high speeds and long ranges. <strong>Radio waves</strong> are used for Wi-Fi and mobile data.</p>
      </div>
    </div>

    <h2 class="section-title">3.5.4 Wired vs Wireless</h2>
    <table style="width:100%; border-collapse: collapse; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
      <tr style="background: var(--brand-surface); color: white; font-weight: bold;">
        <td style="padding: 10px; border: 1px solid var(--border);">Feature</td>
        <td style="padding: 10px; border: 1px solid var(--border);">Wired <span class="spec-badge">Ethernet not examined from 2027</span></td>
        <td style="padding: 10px; border: 1px solid var(--border);">Wireless <span class="spec-badge">Wi-Fi not examined from 2027</span></td>
      </tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Speed</strong></td><td style="padding: 8px; border: 1px solid var(--border);">Higher and very stable</td><td style="padding: 8px; border: 1px solid var(--border);">Variable; depends on distance and obstacles</td></tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Mobility</strong></td><td style="padding: 8px; border: 1px solid var(--border);">Limited &mdash; you must be plugged in</td><td style="padding: 8px; border: 1px solid var(--border);">Free to move within range</td></tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Security</strong></td><td style="padding: 8px; border: 1px solid var(--border);">Harder to intercept (physical access needed)</td><td style="padding: 8px; border: 1px solid var(--border);">Signals broadcast in the air; need encryption (WPA2/WPA3)</td></tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);"><strong>Setup</strong></td><td style="padding: 8px; border: 1px solid var(--border);">Cabling can be expensive and disruptive</td><td style="padding: 8px; border: 1px solid var(--border);">Cheap and quick to add new devices</td></tr>
    </table>

    <h2 class="section-title">3.5.5 Protocols &amp; Addressing</h2>
    <div class="card-grid" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">
      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <h3>Addressing</h3>
        <ul style="flex-grow: 1;">
          <li><strong>MAC Address:</strong> A permanent, 12-digit hexadecimal physical address hard-coded into every network card.</li>
          <li><strong>IP Address:</strong> A 32-bit (IPv4) or 128-bit (IPv6) number used for routing data packets across a network.</li>
        </ul>
      </div>

      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <h3>Core Protocols</h3>
        <p>Protocols are sets of rules that allow devices to speak the same language.</p>
        
        <h4 style="margin: 10px 0 5px 0; color: var(--dark-purple);">Transmission & Routing</h4>
        <ul style="margin-bottom: 10px;">
          <li><strong>TCP:</strong> Breaks data into packets, reassembles them, and checks for errors.</li>
          <li><strong>IP:</strong> Responsible for routing packets to the correct destination using IP addresses.</li>
          <li><strong>UDP:</strong> <span class="spec-badge">Not examined from 2027</span> A faster, "connectionless" alternative to TCP used for live streaming/gaming where speed is prioritized over reliability.</li>
        </ul>

        <h4 style="margin: 10px 0 5px 0; color: var(--dark-purple);">Web &amp; File Transfer</h4>
        <ul style="margin-bottom: 10px;">
          <li><strong>HTTP/HTTPS:</strong> Rules for web browsers to access websites; HTTPS uses encryption for security.</li>
          <li><strong>FTP:</strong> <span class="spec-badge">Not examined from 2027</span> Used specifically for transferring files over a network.</li>
        </ul>

        <h4 style="margin: 10px 0 5px 0; color: var(--dark-purple);">Email Protocols</h4>
        <ul style="flex-grow: 1;">
          <li><strong>SMTP:</strong> Used to <strong>send</strong> emails to a server.</li>
          <li><strong>IMAP:</strong> Used to <strong>retrieve</strong> and manage emails on a server (syncs across devices).</li>
          <li><strong>POP:</strong> Used to <strong>download</strong> emails from a server to a single device (deletes them from server).</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title">3.5.6 The TCP/IP Layer Stack</h2>
    <div class="card-grid" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">
      <div class="card" style="flex: 1 1 100%; border-top: 5px solid var(--dark-purple);">
        <h3>The 4-Layer Model</h3>
        <p>Networking protocols are organised into layers to ensure compatibility and simplify complex communication.</p>
        
        <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); gap: 15px; margin-top: 20px;">
          <li><strong>1. Application:</strong> Where the user interacts with the network (e.g., Browsers using HTTP, Email using SMTP).</li>
          <li><strong>2. Transport:</strong> Establishes the connection and splits data into packets (TCP).</li>
          <li><strong>3. Network/Internet:</strong> Addresses and routes the packets across different networks (IP).</li>
          <li><strong>4. Data Link/Link:</strong> The physical hardware connection (Network Interface Card and MAC addresses).</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title" style="margin-top: 40px;">Protocol Matching Game</h2>
    <p>Drag the protocol to the correct TCP/IP layer definition.</p>
    
    <div class="homework-box">
      <div id="role-bank" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; padding: 15px; background: var(--bg); border-radius: 8px; min-height: 50px;">
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-http" data-phase="app">HTTP</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-https" data-phase="app">HTTPS</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-smtp" data-phase="app">SMTP</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-imap" data-phase="app">IMAP</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-tcp" data-phase="trans">TCP</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-ip" data-phase="net">IP</div>
      </div>

      <div class="card-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" id="app">
          <h3>Application Layer</h3>
          <p style="font-size:0.8rem; color:var(--text-light);">Web browsers, Email clients</p>
        </div>
        <div class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" id="trans">
          <h3>Transport Layer</h3>
          <p style="font-size:0.8rem; color:var(--text-light);">Splitting data into packets</p>
        </div>
        <div class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" id="net">
          <h3>Internet Layer</h3>
          <p style="font-size:0.8rem; color:var(--text-light);">Addressing & Routing</p>
        </div>
      </div>
      
      <div id="game-feedback" style="margin-top: 20px; font-weight: bold; min-height: 24px; text-align: center;"></div>

      <div style="display:flex; justify-content: center; gap: 10px; margin-top: 20px;">
        <button onclick="loadContent('p2_net')" style="padding: 10px 20px; background: var(--pastel-violet); color: var(--dark-purple); font-weight: bold; border: none; border-radius: 5px; cursor: pointer;">Reset Game</button>
      </div>
    </div>

    <h2 class="section-title">3.5.7 The Internet, DNS &amp; Cloud</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--accent-blue);">
        <h3>The Internet</h3>
        <p>A global network of networks that uses the TCP/IP protocol stack. The <strong>World Wide Web (WWW)</strong> is just one service that runs on the internet (using HTTP/HTTPS); the internet also carries email, gaming, video calls, and more.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Domain Name System (DNS)</h3>
        <p>The DNS is the internet's "phonebook". It translates a domain name a human can read (e.g. <code>bbc.co.uk</code>) into the numeric IP address a computer needs to connect.</p>
        <ol>
          <li>Browser asks DNS server: "What is the IP for bbc.co.uk?"</li>
          <li>DNS server replies with the IP (e.g. <code>151.101.0.81</code>).</li>
          <li>Browser opens a connection to that IP and requests the page.</li>
        </ol>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-yellow);">
        <h3>Cloud Computing</h3>
        <p>Storing and processing data on remote servers accessed over the internet rather than on your own device.</p>
        <ul>
          <li><strong>Pros:</strong> access files from anywhere, automatic backup, no need to maintain hardware, scales easily for businesses.</li>
          <li><strong>Cons:</strong> needs internet to use; data privacy depends on the provider; ongoing subscription cost; you don't control the physical hardware.</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title">Key Definitions</h2>
    <div class="card-grid">
      <div class="card"><h3>Protocol</h3><p>An agreed set of rules that lets two devices communicate (e.g. HTTP, TCP, IP).</p></div>
      <div class="card"><h3>Packet</h3><p>A small chunk of data sent across a network. Contains the sender's IP, the receiver's IP, the data itself and a sequence number for reassembly.</p></div>
      <div class="card"><h3>IP Address</h3><p>A logical address used by IP to route data to the right network and device. Can change.</p></div>
      <div class="card"><h3>MAC Address</h3><p>A unique 48-bit physical address built into a NIC at the factory. Stays with the hardware.</p></div>
      <div class="card"><h3>Bandwidth</h3><p>The maximum amount of data that can be carried per second, usually measured in Mbps or Gbps.</p></div>
      <div class="card"><h3>Encryption</h3><p>Scrambling data using a key so only authorised receivers can read it. Used by HTTPS and Wi-Fi.</p></div>
    </div>
  `,

  // --- 3.6 CYBER SECURITY (Updated with Workbook Data) ---
  p2_cyber: `
    <h1>3.6 Cyber Security</h1>
    <p>Cyber security consists of the processes, practices, and technologies designed to protect networks, computers, programs, and data from attack, damage, or unauthorised access.</p>

    <h2 class="section-title">3.6.1 Cyber Security Threats</h2>
    <div class="card-grid" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">
      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <h3>Malware</h3>
        <p>Software designed to harm a computer or user.</p>
        <ul style="flex-grow: 1;">
          <li><strong>Viruses:</strong> Small programs that replicate to spread and aim to delete or damage data.</li>
          <li><strong>Worms:</strong> Replicate to use up system resources, slowing the computer down.</li>
          <li><strong>Trojans:</strong> Disguised as useful programs (like games) but cause harm in the background.</li>
          <li><strong>Spyware/Adware:</strong> Records key strokes or displays unwanted adverts.</li>
        </ul>
      </div>

      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <h3>Social Engineering</h3>
        <p>Manipulating people into giving up confidential information.</p>
        <ul style="flex-grow: 1;">
          <li><strong>Phishing:</strong> Using fake emails or messages to steal sensitive data like passwords.</li>
          <li><strong>Shouldering:</strong> Looking over someone's shoulder to see their PIN or password.</li>
          <li><strong>Blagging:</strong> Creating a fake scenario to trick a victim into giving out information.</li>
        </ul>
      </div>
    </div>

    <button onclick="loadContent('p2_threat_viz')" style="margin-top: 20px; margin-left:15px; padding: 10px 20px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Visualise</button>
    <button onclick="loadContent('p2_phish_game')" style="margin-top: 10px; padding: 10px 20px; background: var(--accent-green-strong); color: white; border: none; border-radius: 5px; cursor: pointer;">Play Spot the Phish</button>
    
    <h3 style="margin-top: 30px; color: var(--dark-purple);">Other Attack Types</h3>
    <div class="card-grid" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">
      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <h3>Technical Attacks</h3>
        <ul style="flex-grow: 1;">
          <li><strong>Brute Force:</strong> Systematically trying every possible password combination until one works.</li>
          <li><strong>DoS (Denial of Service):</strong> Flooding a network with useless traffic to crash it.</li>
          <li><strong>SQL Injection:</strong> Entering malicious SQL code into web forms to manipulate a database.</li>
        </ul>
      </div>
      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <h3>Data Interception</h3>
        <p>Using "packet sniffers" to intercept data packets as they travel across a network.</p>
      </div>
    </div>

    <button onclick="loadContent('p2_attack_viz')" style="margin-top: 20px; margin-left:15px; padding: 10px 20px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Visualise</button>

    <h3 style="margin-top: 30px; color: var(--dark-purple);">How AI Changes These Threats</h3>
    <div class="beyond-spec">
      <span class="spec-badge spec-badge--beyond">Beyond the spec</span>
      <p>Attackers now use AI tools to make the threats above more convincing and easier to run at scale. The threats themselves are the same ones you need to know.</p>
      <div class="card-grid">
        <div class="card">
          <h3>Phishing</h3>
          <p>AI writes fluent, personalised messages with no spelling mistakes, using details scraped from social media. "Look for bad spelling" is no longer enough: check the <strong>sender's address</strong>, <strong>hover over links</strong>, and be suspicious of <strong>urgency</strong>.</p>
        </div>
        <div class="card">
          <h3>Blagging with Deepfakes</h3>
          <p>A cloned voice or video of a boss or family member asks for money or a password. Defence: <strong>verify through a separate channel</strong> you already trust, such as calling back on a known number.</p>
        </div>
        <div class="card">
          <h3>Password Guessing</h3>
          <p>Tools learn from leaked password lists which patterns people use, so predictable choices like <code>Summer2026!</code> fall quickly. Long, unique passwords resist this.</p>
        </div>
        <div class="card" style="border-top: 5px solid var(--accent-green);">
          <h3>AI on Defence</h3>
          <p>Anti-malware and firewalls also use AI to spot <strong>unusual behaviour</strong>, such as a program suddenly encrypting many files, instead of only matching known threats.</p>
        </div>
      </div>
      <span class="beyond-why">AI is not named in the AQA specification. In an exam, describe these as phishing, blagging or brute force, which are the terms that earn marks. This section is not included in quizzes or mocks.</span>
    </div>

    <h2 class="section-title">3.6.2 Methods of Detecting &amp; Preventing Threats</h2>
    <div class="card-grid" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">
      <div class="card" style="flex: 1 1 100%; border-top: 5px solid var(--accent-green);">
        <h3>Defensive Methods</h3>
        <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); gap: 15px; margin-top: 10px;">
          <li><strong>Penetration Testing:</strong> Authorised simulated attacks to find weaknesses.</li>
          <li><strong>Firewalls:</strong> Hardware or software that monitors and filters incoming/outgoing traffic.</li>
          <li><strong>Encryption:</strong> Scrambling data so it can only be read with a correct key.</li>
          <li><strong>Passwords/Biometrics:</strong> Ensuring only authorised users can access the system.</li>
          <li><strong>Anti-Malware:</strong> Software that detects, prevents, and removes malicious programs.</li>
        </ul>
      </div>
    </div>

  `,

  p2_threat_viz: `
    <h1>How Threats Actually Work</h1>
    <p>Select a threat to walk through its <strong>Infection Cycle</strong>.</p>
    
    <div style="background: #111; padding: 30px; border-radius: 12px; margin: 20px 0; min-height: 400px; color: white;">
      <div id="viz-stage-title" style="font-size: 1.5rem; color: var(--accent-green-text); margin-bottom: 10px;">Select a Threat Below</div>
      
      <!-- These three used to be emoji at 3rem. They are words now, so the row is
           sized for text and the two ends are boxed to read as nodes. -->
      <div id="viz-graphic-container" class="threat-diagram">
        <div id="viz-source" class="threat-node is-idle">Source</div>
        <div id="viz-path" class="threat-path">- - - - -</div>
        <div id="viz-target" class="threat-node is-idle">Target</div>
      </div>

      <div id="viz-explanation" style="background: #222; padding: 20px; border-radius: 8px; font-family: monospace; line-height: 1.6;">
        Click a button to see the step-by-step logic of the attack.
      </div>

      <div style="display: flex; justify-content: center; gap: 10px; margin-top: 30px;">
        <button onclick="runThreatLogic('virus')" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">Virus</button>
        <button onclick="runThreatLogic('worm')" style="padding: 10px 20px; background: var(--accent-orange-strong); color: white; border: none; border-radius: 5px; cursor: pointer;">Worm</button>
        <button onclick="runThreatLogic('trojan')" style="padding: 10px 20px; background: #6f42c1; color: white; border: none; border-radius: 5px; cursor: pointer;">Trojan</button>
        <button onclick="runThreatLogic('phishing')" style="padding: 10px 20px; background: var(--accent-blue-strong); color: white; border: none; border-radius: 5px; cursor: pointer;">Phishing</button>
      </div>
    </div>

    <button onclick="loadContent('p2_cyber')" style="padding: 10px 20px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Back to Threats</button>
  `,

  p2_phish_game: `
  <h1>Spot the Phish Challenge</h1>
  <p>Social engineering involves manipulating people into giving up confidential information. Can you find the 4 red flags in this email?</p>
  
  <div style="background: white; color: #333; padding: 20px; border-radius: 8px; max-width: 600px; margin: 20px auto; border: 1px solid #ccc; text-align: left; font-family: Arial, sans-serif;">
    <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
      <strong>From:</strong> <span class="phish-target" onclick="revealPhish(this, 'Spoofed Email: It says \\'Security\\', but the address is on \\'security-bank-web.net\\', not the bank\\'s real domain')">Security Center &lt;account-verify@security-bank-web.net&gt;</span><br>
      <strong>Subject:</strong> <span class="phish-target" onclick="revealPhish(this, 'Urgency: Using alarming language like \\'Immediate Action\\' is a common tactic')">URGENT: Immediate Action Required - Account Suspended</span>
    </div>
    
    <p class="phish-target" onclick="revealPhish(this, 'Generic Greeting: Real banks usually use your actual name, not \\'Dear Customer\\'')">Dear Valued Customer,</p>
    
    <p>We have detected suspicious activity on your account. To prevent unauthorized access, we have temporarily suspended your banking privileges.</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <span class="phish-target" onclick="revealPhish(this, 'Suspicious Link: Hovering would show it leads to a non-bank website')" style="background: var(--accent-blue-strong); color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer; display: inline-block;">Verify Account Identity Now</span>
    </div>
    
    <p>If you do not complete this verification within 24 hours, your account will be permanently closed.</p>
    <p>Thank you,<br>The Security Team</p>
  </div>

  <div id="phish-feedback" style="min-height: 40px; color: var(--accent-green-text); font-weight: bold; margin: 20px 0;">Found: 0 / 4 Red Flags</div>
  
  <button onclick="loadContent('p2_cyber')" style="padding: 10px 20px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Back to Security</button>

  <style>
    .phish-target { cursor: pointer; transition: background 0.3s; padding: 2px; }
    .phish-target:hover { background: #fff3cd; }
    .phish-found { background: #d4edda !important; color: #155724 !important; text-decoration: line-through; pointer-events: none; }
  </style>
`,

  p2_attack_viz: `
    <h1>Technical Attack Visualisation</h1>
    <p>See how <strong>automated</strong> and <strong>code-based</strong> attacks target system weaknesses.</p>
    
    <div style="background: #111; padding: 30px; border-radius: 12px; margin: 20px 0; min-height: 450px; color: white; display: flex; flex-direction: column; gap: 20px;">
      
      <div id="target-server" style="border: 2px solid #333; padding: 20px; border-radius: 8px; text-align: center;">
        <div id="server-status" style="color: var(--accent-green); font-weight: bold; margin-bottom: 10px;">SERVER STATUS: ONLINE</div>
        
        <div id="server-load" style="width: 100%; height: 10px; background: #222; margin-top: 10px; border-radius: 5px; overflow: hidden;">
          <div id="load-bar" style="width: 5%; height: 100%; background: var(--accent-green); transition: width 0.3s;"></div>
        </div>
      </div>

      <div style="background: #000; border: 1px solid #0f0; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 0.9rem; color: #0f0;">
        <div id="console-output">> Ready for instruction...</div>
      </div>

      <div style="display: flex; justify-content: center; gap: 10px;">
        <button onclick="runAttackLogic('brute')" style="padding: 10px; background: #555; color: white; border: none; border-radius: 4px; cursor: pointer;">Brute Force</button>
        <button onclick="runAttackLogic('dos')" style="padding: 10px; background: #555; color: white; border: none; border-radius: 4px; cursor: pointer;">DoS Attack</button>
        <button onclick="runAttackLogic('sql')" style="padding: 10px; background: #555; color: white; border: none; border-radius: 4px; cursor: pointer;">SQL Injection</button>
      </div>
    </div>

    <button onclick="loadContent('p2_cyber')" style="padding: 10px 20px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Back to Security</button>
  `,

  // --- 3.7 DATABASES (Merged & Finalised) ---
  p2_sql: `
    <h1>3.7 Relational Databases (SQL)</h1>
    <p>A database is a <strong>persistent, organised store of related data</strong>. Persistent means the data is permanent and remains stored even after the computer is turned off.</p>

    <h2 class="section-title">3.7.1 Relational Databases</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Important Terminology</h3>
        <ul>
          <li><strong>Table:</strong> A collection of data relating to an entity (e.g. students).</li>
          <li><strong>Record:</strong> A collection of data about a single entity, represented as a row.</li>
          <li><strong>Field:</strong> A unique piece of data about an entity, represented as a column.</li>
          <li><strong>Primary Key:</strong> A field used to uniquely identify each record in a table.</li>
          <li><strong>Foreign Key:</strong> A primary key from one table used in another to link them together.</li>
        </ul>
      </div>

      <div class="card">
        <h3>Flat File vs. Relational</h3>
        <p><strong>Flat File:</strong> A single table of data. These often suffer from <strong>data redundancy</strong> (duplicate data), which is inefficient and prone to human error.</p>
        <p><strong>Relational:</strong> Uses multiple tables linked via keys. This reduces errors, saves time, and makes updating data much easier.</p>
      </div>
    </div>

    

    <h2 class="section-title">3.7.2 Structured Query Language (SQL)</h2>
    <p>SQL is the standard language used to create, update, delete, and query (search) databases.</p>

    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Creating & Inserting</h3>
        <p><strong>CREATE TABLE:</strong> Sets up a new table with specific fields and data types.</p>
        <code style="display:block; background:var(--bg); padding:10px; border-radius:5px; font-family:monospace; color:var(--text);">CREATE TABLE Students<br>(student_ID text, first_name text, surname text, form text, age number)</code>
        
        <p><strong>INSERT INTO:</strong> Adds a new record to a table.</p>
        <code style="display:block; background:var(--bg); padding:10px; border-radius:5px; font-family:monospace; color:var(--text);">INSERT INTO students<br>VALUES ('009', 'Jim', 'Smith', '9AB', 14)</code>
      </div>

      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Querying & Modifying</h3>
        <p><strong>SELECT:</strong> Used to retrieve specific data. Use * as a wildcard for "all".</p>
        <code style="display:block; background:var(--bg); padding:10px; border-radius:5px; font-family:monospace; color:var(--text);">SELECT first_name, surname FROM students<br>WHERE form = '9AB' ORDER BY surname DESC</code>

        <p><strong>UPDATE:</strong> Alters existing data in the database.</p>
        <code style="display:block; background:var(--bg); padding:10px; border-radius:5px; font-family:monospace; color:var(--text);">UPDATE students SET surname = 'Hickman'<br>WHERE first_name = 'Sam'</code>
      </div>
    </div>

    <div class="homework-box">
      <h3>DBMS Capabilities</h3>
      <p>A Database Management System (DBMS) is the software used to manage data. It must be able to: <strong>Create, Add, Delete, Edit,</strong> and <strong>Search</strong> for data.</p>
    </div>

    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--accent-red);">
        <h3>Deleting Records</h3>
        <p><strong>DELETE FROM:</strong> Removes one or more records that match a condition. Always include a <code>WHERE</code> clause &mdash; without one, every row in the table will be deleted.</p>
        <code style="display:block; background:var(--bg); padding:10px; border-radius:5px; font-family:monospace; color:var(--text);">DELETE FROM students<br>WHERE student_ID = '009'</code>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-yellow);">
        <h3>Querying Multiple Tables</h3>
        <p>When data is spread across two tables, link them with their primary/foreign key inside the <code>WHERE</code> clause.</p>
        <code style="display:block; background:var(--bg); padding:10px; border-radius:5px; font-family:monospace; color:var(--text);">SELECT students.first_name, classes.subject<br>FROM students, classes<br>WHERE students.class_ID = classes.class_ID</code>
      </div>
    </div>

    <h2 class="section-title">Worked Example: Sample Database</h2>
    <p>Look at this <code>Students</code> table and follow the queries below.</p>

    <table style="width:100%; border-collapse: collapse; margin-top: 10px; background: var(--card-bg); border: 1px solid var(--border);">
      <tr style="background: var(--brand-surface); color: white; font-weight: bold;">
        <td style="padding: 10px; border: 1px solid var(--border);">student_ID</td>
        <td style="padding: 10px; border: 1px solid var(--border);">first_name</td>
        <td style="padding: 10px; border: 1px solid var(--border);">surname</td>
        <td style="padding: 10px; border: 1px solid var(--border);">form</td>
        <td style="padding: 10px; border: 1px solid var(--border);">age</td>
      </tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);">001</td><td style="padding: 8px; border: 1px solid var(--border);">Aisha</td><td style="padding: 8px; border: 1px solid var(--border);">Khan</td><td style="padding: 8px; border: 1px solid var(--border);">9AB</td><td style="padding: 8px; border: 1px solid var(--border);">14</td></tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);">002</td><td style="padding: 8px; border: 1px solid var(--border);">Ben</td><td style="padding: 8px; border: 1px solid var(--border);">Owusu</td><td style="padding: 8px; border: 1px solid var(--border);">9CD</td><td style="padding: 8px; border: 1px solid var(--border);">15</td></tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);">003</td><td style="padding: 8px; border: 1px solid var(--border);">Chloe</td><td style="padding: 8px; border: 1px solid var(--border);">Smith</td><td style="padding: 8px; border: 1px solid var(--border);">9AB</td><td style="padding: 8px; border: 1px solid var(--border);">14</td></tr>
      <tr><td style="padding: 8px; border: 1px solid var(--border);">004</td><td style="padding: 8px; border: 1px solid var(--border);">Daniel</td><td style="padding: 8px; border: 1px solid var(--border);">Park</td><td style="padding: 8px; border: 1px solid var(--border);">9CD</td><td style="padding: 8px; border: 1px solid var(--border);">14</td></tr>
    </table>

    <div class="card-grid" style="margin-top: 20px;">
      <div class="card" style="border-top: 5px solid var(--accent-blue);">
        <h3>Q1: List names of form 9AB</h3>
        <code style="display:block; background:var(--bg); padding:10px; border-radius:5px; font-family:monospace; color:var(--text);">SELECT first_name, surname<br>FROM students<br>WHERE form = '9AB'</code>
        <p style="margin-top: 10px;"><strong>Result:</strong></p>
        <ul>
          <li>Aisha Khan</li>
          <li>Chloe Smith</li>
        </ul>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-blue);">
        <h3>Q2: List 14-year-olds, surnames Z to A</h3>
        <code style="display:block; background:var(--bg); padding:10px; border-radius:5px; font-family:monospace; color:var(--text);">SELECT * FROM students<br>WHERE age = 14<br>ORDER BY surname DESC</code>
        <p style="margin-top: 10px;"><strong>Result order:</strong> Smith, Park, Khan.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-blue);">
        <h3>Q3: Update Daniel's form</h3>
        <code style="display:block; background:var(--bg); padding:10px; border-radius:5px; font-family:monospace; color:var(--text);">UPDATE students<br>SET form = '9AB'<br>WHERE student_ID = '004'</code>
        <p style="margin-top: 10px;"><em>Daniel is moved into form 9AB. Without the WHERE clause every student would be moved.</em></p>
      </div>
    </div>

    <h2 class="section-title">Why Use Relational Databases?</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Pros</h3>
        <ul>
          <li><strong>No redundancy</strong> &mdash; each fact is stored once.</li>
          <li><strong>Consistent</strong> &mdash; updating one record updates the whole system.</li>
          <li><strong>Powerful querying</strong> &mdash; SQL can answer complex questions.</li>
          <li><strong>Better security</strong> &mdash; permissions can be set per table or field.</li>
        </ul>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-red);">
        <h3>Cons</h3>
        <ul>
          <li>More complex to design than a flat file.</li>
          <li>Can be slower for very simple data.</li>
          <li>Requires DBMS software, which may cost money.</li>
        </ul>
      </div>
    </div>

  `,

  // --- 3.8 IMPACTS OF TECH (Updated with Workbook Data) ---
  p2_impact: `
    <h1>3.8 Impacts of Digital Technology</h1>
    <p>As technology develops, it creates a range of issues that can be categorised as ethical, legal, cultural, environmental, and privacy-related. To understand these, we must look at them through the eyes of <strong>stakeholders</strong>—individuals or groups affected by an issue.</p>

    <h2 class="section-title">Ethical, Cultural &amp; Social Issues</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Privacy & Surveillance</h3>
        <p>Personal data is collected by social media, doctors, and the police. While this can keep us safe, it leads to the <strong>Erosion of Privacy</strong>. If this data falls into the wrong hands, it can lead to identity theft.</p>
      </div>
      <div class="card">
        <h3>The Digital Divide</h3>
        <p>The gap between those with access to fast technology and those without. This exists between urban and rural areas, as well as between developed and developing countries, affecting job prospects and profits.</p>
      </div>
      <div class="card">
        <h3>Work-Life Balance</h3>
        <p>Mobile technology allows for flexible working and higher productivity, but many workers struggle to "switch off," leading to higher stress and a poor home-life balance.</p>
      </div>
      <div class="card">
        <h3>Health Issues</h3>
        <p>Dependency on computers has led to a rise in obesity due to inactivity, as well as physical problems like <strong>Repetitive Strain Injury (RSI)</strong> and backache from poor posture.</p>
      </div>
    </div>

    <h2 class="section-title">Environmental Impacts</h2>
    <div class="homework-box">
      <p>Technology impacts the environment in three main ways:</p>
      <ul>
        <li><strong>Energy Consumption:</strong> Devices and data centres require vast amounts of electricity, often produced by burning fossil fuels.</li>
        <li><strong>Manufacturing:</strong> Creating components produces waste products and uses precious raw materials.</li>
        <li><strong>E-Waste:</strong> Rapid development means devices become obsolete quickly. Mobile devices often end up in landfills, where batteries leak harmful chemicals.</li>
      </ul>
    </div>

    <h2 class="section-title">Legislation (The Law)</h2>
    <p>These four laws govern how computers and data are used in the UK. Creative Commons, the last card, is not a law: it is a licence creators use to give permission in advance.</p>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Data Protection Act (2018)</h3>
        <p>Controls how personal data is used by organisations. Data must be used fairly, kept secure, and not kept for longer than necessary.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Computer Misuse Act (1990)</h3>
        <p>Prevents unauthorised access to networks (hacking), the unauthorised modification of data, and the creation of malware.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Copyright, Designs & Patents Act (1988)</h3>
        <p>Makes it illegal to copy or share original work (like music, software, images or writing) without the owner's permission. It protects the work itself, not the idea behind it.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Freedom of Information Act (2000)</h3>
        <p>Provides public access to information held by public sector organisations like the NHS, police, and schools to ensure transparency.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Creative Commons Licensing</h3>
        <p>A licence, not a law. Owners use it to say in advance how others may use and share their work (e.g., non-commercial use only or requiring attribution), within copyright law.</p>
      </div>
    </div>

    <h2 class="section-title">Stakeholders</h2>
    <p>A <strong>stakeholder</strong> is any person or group affected by a piece of technology. In an exam answer about impact, you should always identify <strong>who</strong> is affected and <strong>how</strong> &mdash; both positively and negatively.</p>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--accent-blue);">
        <h3>Common Stakeholders</h3>
        <ul>
          <li><strong>Individuals / Users</strong> &mdash; personal data, privacy, health.</li>
          <li><strong>Businesses</strong> &mdash; profit, productivity, security risk.</li>
          <li><strong>Employees</strong> &mdash; job security, work-life balance.</li>
          <li><strong>Society</strong> &mdash; digital divide, fairness, culture.</li>
          <li><strong>Government</strong> &mdash; legislation, surveillance, public services.</li>
          <li><strong>Environment</strong> &mdash; energy use, e-waste, raw materials.</li>
        </ul>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-yellow);">
        <h3>Worked Example: Self-Driving Cars</h3>
        <ul>
          <li><strong>Drivers (positive):</strong> hands-free travel, accessibility for the elderly or disabled.</li>
          <li><strong>Society (positive):</strong> potentially fewer accidents caused by human error.</li>
          <li><strong>Taxi/HGV drivers (negative):</strong> jobs at risk of replacement.</li>
          <li><strong>Government (legal):</strong> who is liable when a self-driving car causes a crash?</li>
          <li><strong>Environment:</strong> electric autonomous cars cut emissions but more vehicles increase resource use.</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title">Case Study: Artificial Intelligence</h2>
    <div class="beyond-spec">
      <span class="spec-badge spec-badge--beyond">Beyond the spec</span>
      <p><strong>Artificial intelligence (AI)</strong> describes systems that learn patterns from large amounts of data and use them to make predictions or create content: recommendation feeds, face recognition, chatbots and self-driving cars all work this way. Because AI raises every type of issue on this page, it is good practice for applying them.</p>
      <div class="card-grid">
        <div class="card" style="border-top: 5px solid var(--accent-green);">
          <h3>Positive Impacts</h3>
          <ul>
            <li><strong>Health:</strong> spotting signs of disease in scans, helping doctors diagnose earlier.</li>
            <li><strong>Accessibility:</strong> live captions, speech-to-text and translation for disabled users and language learners.</li>
            <li><strong>Businesses:</strong> automating repetitive tasks raises productivity.</li>
          </ul>
        </div>
        <div class="card" style="border-top: 5px solid var(--accent-red);">
          <h3>Ethical Issues</h3>
          <ul>
            <li><strong>Bias:</strong> an AI trained on past data repeats its unfairness. A CV-screening tool trained on previous hires can reject applicants who don't match them.</li>
            <li><strong>Accountability:</strong> when an AI decision is wrong, who is responsible: the developer, the company using it, or the user?</li>
          </ul>
        </div>
        <div class="card" style="border-top: 5px solid var(--accent-blue);">
          <h3>Legal &amp; Privacy Issues</h3>
          <ul>
            <li><strong>Personal data:</strong> AI is trained on huge amounts of data about people. Under the <em>Data Protection Act 2018</em> that data must be used fairly, lawfully and kept secure.</li>
            <li><strong>Surveillance:</strong> face recognition in public places can track people without their consent.</li>
            <li><strong>Copyright:</strong> AI trained on artists' and writers' work raises questions under the <em>Copyright, Designs &amp; Patents Act</em> about who owns the work it produces.</li>
          </ul>
        </div>
        <div class="card" style="border-top: 5px solid var(--accent-yellow);">
          <h3>Cultural &amp; Social Issues</h3>
          <ul>
            <li><strong>Jobs:</strong> automation replaces some roles (customer service, data entry) while creating new ones.</li>
            <li><strong>Deepfakes:</strong> fake but realistic images, audio and video spread misinformation and make people trust what they see less.</li>
            <li><strong>Digital divide:</strong> people without access to AI tools, or the skills to use them, fall further behind.</li>
          </ul>
        </div>
        <div class="card" style="border-top: 5px solid var(--accent-green);">
          <h3>Environmental Issues</h3>
          <ul>
            <li><strong>Energy:</strong> training and running large AI models uses data centres that need vast amounts of electricity, plus water for cooling.</li>
            <li><strong>Hardware:</strong> demand for specialist chips uses raw materials and adds to e-waste.</li>
            <li><strong>But:</strong> AI can also cut energy use, for example by balancing power grids.</li>
          </ul>
        </div>
      </div>

      <details class="card" style="margin-top: 20px;">
        <summary style="cursor: pointer; font-weight: 700;">Practice: plan an answer using the 3-step structure</summary>
        <p style="margin-top: 12px;"><em>"A supermarket installs AI face recognition cameras to identify known shoplifters. Discuss the impacts."</em></p>
        <ol>
          <li><strong>Issues:</strong> privacy (customers filmed and identified), ethical (bias if the system misidentifies some groups more often), legal (Data Protection Act 2018).</li>
          <li><strong>Stakeholders:</strong> customers, staff, the supermarket, people wrongly flagged.</li>
          <li><strong>Balance:</strong> fewer thefts and safer staff, against customers' loss of privacy and the harm of being wrongly accused.</li>
        </ol>
      </details>

      <span class="beyond-why">AI is not named in the AQA specification, so you won't be asked about it by name. It's here to practise applying the issues and stakeholders above to a new technology, which is what impact questions ask you to do. It is not included in quizzes or mocks.</span>
    </div>

    <h2 class="section-title">Exam Tip: Structuring Impact Answers</h2>
    <div class="homework-box">
      <p>For longer mark questions, use this 3-step structure:</p>
      <ol>
        <li><strong>Name the issue</strong> (ethical, legal, cultural, environmental, privacy).</li>
        <li><strong>Identify the stakeholders</strong> affected.</li>
        <li><strong>Give a balanced argument</strong> &mdash; at least one positive and one negative impact, plus any relevant law (e.g. <em>Data Protection Act 2018</em>).</li>
      </ol>
    </div>

  `,

  // --- UPDATED RESOURCES PAGE ---
  resources: `
    <h1>Revision Resources</h1>
    
    <h2 class="resource-section-header">Interactive Website Activities</h2>
    <div class="card-grid">
      <div class="card" onclick="loadContent('p1_revision')" style="cursor: pointer; border-left: 5px solid #FFC107;">
        <h3>Paper 1 Flashcards</h3>
        <p>Review Algorithms and Programming keywords.</p>
      </div>
      <div class="card" onclick="loadContent('p2_revision')" style="cursor: pointer; border-left: 5px solid #FFC107;">
        <h3>Paper 2 Flashcards</h3>
        <p>Review Systems, Networks, and Impact keywords.</p>
      </div>
      <div class="card" onclick="loadContent('p2_net')" style="cursor: pointer; border-left: 5px solid var(--dark-purple);">
        <h3>Protocol Matching Game</h3>
        <p>Match protocols to their TCP/IP layers.</p>
      </div>
      <div class="card" onclick="loadContent('p2_phish_game')" style="cursor: pointer; border-left: 5px solid var(--accent-green);">
        <h3>Spot the Phish</h3>
        <p>Identify red flags in social engineering attacks.</p>
      </div>
      <div class="card" onclick="loadContent('p2_rle_act')" style="cursor: pointer; border-left: 5px solid var(--dark-purple);">
        <h3>RLE Compression</h3>
        <p>Practise Run-Length Encoding logic.</p>
      </div>
      <div class="card" onclick="loadContent('prac_challenges')" style="cursor: pointer; border-left: 5px solid #28a745;">
        <h3>Python Challenges</h3>
        <p>Graded challenges and debugging activities.</p>
      </div>
    </div>

    <h2 class="resource-section-header">External Learning Tools</h2>
    <div class="card-grid">
      <div class="card" onclick="window.open('https://mrowoyemi.github.io/GCSE-COMP-SCI-TRAINER/', '_blank')" style="cursor: pointer; border-top: 5px solid #007BFF;">
        <h3>Mini Quiz Trainer</h3>
        <p>Rapid-fire questions for all AQA topics.</p>
      </div>
      <div class="card" onclick="window.open('https://crookhorncollege.itslearning.com/', '_blank')" style="cursor: pointer; border-top: 5px solid #6f42c1;">
        <h3>itslearning Resources</h3>
        <p>Access school-specific revision materials and folders.</p>
      </div>
      <div class="card" onclick="window.open('https://www.senecalearning.com/', '_blank')" style="cursor: pointer; border-top: 5px solid #28a745;">
        <h3>Seneca Learning</h3>
        <p>Interactive AQA GCSE Computer Science revision courses.</p>
      </div>
      <div class="card" onclick="window.open('https://www.online-python.com/', '_blank')" style="cursor: pointer; border-top: 5px solid var(--dark-purple);">
        <h3>Online Python Compiler</h3>
        <p>Practise your coding skills directly in the browser.</p>
      </div>
    </div>
    
    
  `,

  // --- IDEA 1: GRADED CHALLENGE BANK ---
  prac_challenges: `
    <h1>Python Challenge Bank</h1>
    <p>Work through these graded challenges to build your programming confidence. These are adapted from Nicola Lacey's excellent workbook.</p>
    
    <div style="background: var(--pastel-violet); padding: 20px; border-radius: 8px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; border-left: 5px solid var(--dark-purple);">
      <div>
        <h3 style="margin:0 0 5px 0; color: var(--dark-purple);">Ready for a harder test?</h3>
        <p style="margin:0; color: var(--text); font-size: 0.95rem;">Try reading and fixing broken code in our side-by-side workspace.</p>
      </div>
      <button onclick="loadContent('prac_debugging')" style="padding: 10px 20px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; white-space: nowrap;">Try Debugging </button>
    </div>

    <h2 class="section-title">Level 1: The Basics (Sequence & Variables)</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid #28a745;">
        <h3>Challenge 001</h3>
        <p>Ask for the user's first name and display the output message Hello [First Name].</p>
        <button onclick="let sol=document.getElementById('sol-001'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-001" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">firstname = input("Please enter your first name: ")
print("Hello", firstname)</div>
      </div>

      <div class="card" style="border-top: 5px solid #28a745;">
        <h3>Challenge 002</h3>
        <p>Ask for the user’s first name and then ask for their surname and display the output message: Hello [First Name] [Surname].</p>
        <button onclick="let sol=document.getElementById('sol-002'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-002" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">firstname = input("Please enter your first name: ")
surname = input("Please enter your surname: ")
print("Hello", firstname, surname)</div>
      </div>

      <div class="card" style="border-top: 5px solid #28a745;">
        <h3>Challenge 003</h3>
        <p>Write code that will display the joke "What do you call a bear with no teeth?" and on the next line display the answer "A gummy bear!" Try to create it using only one line of code.</p>
        <button onclick="let sol=document.getElementById('sol-003'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-003" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">print("What do you call a bear with no teeth?\\nA gummy bear!")</div>
      </div>

      <div class="card" style="border-top: 5px solid #28a745;">
        <h3>Challenge 004</h3>
        <p>Ask the user to enter two numbers. Add them together and display the answer as The total is [answer].</p>
        <button onclick="let sol=document.getElementById('sol-004'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-004" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num1 = int(input("Please enter your first number: "))
num2 = int(input("Please enter your second number: "))
answer = num1 + num2
print("The total is", answer)</div>
      </div>

      <div class="card" style="border-top: 5px solid #28a745;">
        <h3>Challenge 005</h3>
        <p>Ask the user to enter three numbers. Add together the first two numbers and then multiply this total by the third. Display the answer as The answer is [answer].</p>
        <button onclick="let sol=document.getElementById('sol-005'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-005" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num1 = int(input("Please enter your first number: "))
num2 = int(input("Please enter your second number: "))
num3 = int(input("Please enter your third number: "))
answer = (num1 + num2) * num3
print("The answer is", answer)</div>
      </div>
    </div>

    <h2 class="section-title" style="margin-top:40px;">Level 2: Selection (If Statements)</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid #ffc107;">
        <h3>Challenge 012</h3>
        <p>Ask for two numbers. If the first one is larger than the second, display the second number first and then the first number, otherwise show the first number first and then the second.</p>
        <button onclick="let sol=document.getElementById('sol-012'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-012" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num1 = int(input("Enter first number: "))
num2 = int(input("Enter second number: "))
if num1 > num2:
    print(num2, num1)
else:
    print(num1, num2)</div>
      </div>

      <div class="card" style="border-top: 5px solid #ffc107;">
        <h3>Challenge 013</h3>
        <p>Ask the user to enter a number that is under 20. If they enter a number that is 20 or more, display the message "Too high", otherwise display "Thank you".</p>
        <button onclick="let sol=document.getElementById('sol-013'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-013" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num = int(input("Enter a value less than 20: "))
if num >= 20:
    print("Too high")
else:
    print("Thank you")</div>
      </div>

      <div class="card" style="border-top: 5px solid #ffc107;">
        <h3>Challenge 014</h3>
        <p>Ask the user to enter a number between 10 and 20 (inclusive). If they enter a number within this range, display the message "Thank you", otherwise display the message "Incorrect answer".</p>
        <button onclick="let sol=document.getElementById('sol-014'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-014" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num = int(input("Enter a value between 10 and 20: "))
if num >= 10 and num <= 20:
    print("Thank you")
else:
    print("Incorrect answer")</div>
      </div>

      <div class="card" style="border-top: 5px solid #ffc107;">
        <h3>Challenge 015</h3>
        <p>Ask the user to enter their favourite colour. If they enter "red", "RED" or "Red" display the message "I like red too", otherwise display the message "I don't like [colour], I prefer red".</p>
        <button onclick="let sol=document.getElementById('sol-015'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-015" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">colour = input("Type in your favourite colour: ")
if colour == "red" or colour == "RED" or colour == "Red":
    print("I like red too")
else:
    print("I don't like", colour, ", I prefer red")</div>
      </div>

      <div class="card" style="border-top: 5px solid #ffc107;">
        <h3>Challenge 016</h3>
        <p>Ask the user if it is raining and convert their answer to lower case. If they answer "yes", ask if it is windy. If they answer "yes" to this second question, display "It is too windy for an umbrella", otherwise display "Take an umbrella". If they did not answer yes to the first question, display "Enjoy your day".</p>
        <button onclick="let sol=document.getElementById('sol-016'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-016" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">raining = input("Is it raining? ")
raining = raining.lower()
if raining == "yes":
    windy = input("Is it windy? ")
    windy = windy.lower()
    if windy == "yes":
        print("It is too windy for an umbrella")
    else:
        print("Take an umbrella")
else:
    print("Enjoy your day")</div>
      </div>
    </div>

    <h2 class="section-title" style="margin-top:40px;">Level 3: Iteration (For Loops)</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid #fd7e14;">
        <h3>Challenge 035</h3>
        <p>Ask the user to enter their name and then display their name three times.</p>
        <button onclick="let sol=document.getElementById('sol-035'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-035" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">name = input("Type in your name: ")
for i in range(0,3):
    print(name)</div>
      </div>

      <div class="card" style="border-top: 5px solid #fd7e14;">
        <h3>Challenge 036</h3>
        <p>Alter program 035 so that it will ask the user to enter their name and a number and then display their name that number of times.</p>
        <button onclick="let sol=document.getElementById('sol-036'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-036" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">name = input("Type in your name: ")
num = int(input("Enter a number: "))
for i in range(0,num):
    print(name)</div>
      </div>

      <div class="card" style="border-top: 5px solid #fd7e14;">
        <h3>Challenge 037</h3>
        <p>Ask the user to enter their name and display each letter in their name on a separate line.</p>
        <button onclick="let sol=document.getElementById('sol-037'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-037" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">name = input("Enter your name: ")
for i in name:
    print(i)</div>
      </div>

      <div class="card" style="border-top: 5px solid #fd7e14;">
        <h3>Challenge 038</h3>
        <p>Change program 037 to also ask for a number. Display their name (one letter at a time on each line) and repeat this for the number of times they entered.</p>
        <button onclick="let sol=document.getElementById('sol-038'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-038" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num = int(input("Enter a number: "))
name = input("Enter your name: ")
for x in range(0,num):
    for i in name:
        print(i)</div>
      </div>

      <div class="card" style="border-top: 5px solid #fd7e14;">
        <h3>Challenge 039</h3>
        <p>Ask the user to enter a number between 1 and 12 and then display the times table for that number.</p>
        <button onclick="let sol=document.getElementById('sol-039'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-039" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num = int(input("Enter a number between 1 and 12: "))
for i in range(1, 13):
    answer = i * num
    print(i, "x", num, "=", answer)</div>
      </div>
    </div>

    <h2 class="section-title" style="margin-top:40px;">Level 4: Iteration (While Loops)</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid #dc3545;">
        <h3>Challenge 045</h3>
        <p>Set the total to 0 to start with. While the total is 50 or less, ask the user to input a number. Add that number to the total and print the message "The total is... [total]". Stop the loop when the total is over 50.</p>
        <button onclick="let sol=document.getElementById('sol-045'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-045" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">total = 0
while total <= 50:
    num = int(input("Enter a number: "))
    total = total + num
    print("The total is...", total)</div>
      </div>

      <div class="card" style="border-top: 5px solid #dc3545;">
        <h3>Challenge 046</h3>
        <p>Ask the user to enter a number. Keep asking until they enter a value over 5 and then display the message "The last number you entered was a [number]" and stop the program.</p>
        <button onclick="let sol=document.getElementById('sol-046'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-046" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num = 0
while num <= 5:
    num = int(input("Enter a number: "))
print("The last number you entered was a", num)</div>
      </div>

      <div class="card" style="border-top: 5px solid #dc3545;">
        <h3>Challenge 047</h3>
        <p>Ask the user to enter a number and then enter another number. Add these two numbers together and then ask if they want to add another number. If they enter "y", ask them to enter another number and keep adding numbers until they do not answer "y". Once the loop has stopped, display the total.</p>
        <button onclick="let sol=document.getElementById('sol-047'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-047" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num1 = int(input("Enter a number: "))
total = num1
again = "y"
while again == "y":
    num2 = int(input("Enter another number: "))
    total = total + num2
    again = input("Do you want to add another number? (y/n) ")
print("The total is", total)</div>
      </div>

      <div class="card" style="border-top: 5px solid #dc3545;">
        <h3>Challenge 048</h3>
        <p>Ask for the name of somebody the user wants to invite to a party. After this, display the message "[name] has now been invited" and add 1 to the count. Then ask if they want to invite somebody else. Keep repeating this until they no longer want to invite anyone else and then display how many people they have coming.</p>
        <button onclick="let sol=document.getElementById('sol-048'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-048" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">again = "y"
count = 0
while again == "y":
    name = input("Enter a name of somebody you want to invite to your party: ")
    print(name, "has now been invited")
    count = count + 1
    again = input("Do you want to invite somebody else? (y/n) ")
print("You have", count, "people coming to your party")</div>
      </div>

      <div class="card" style="border-top: 5px solid #dc3545;">
        <h3>Challenge 049</h3>
        <p>Create a variable called compnum and set the value to 50. Ask the user to enter a number. While their guess is not the same as the compnum value, tell them if their guess is too low or too high and ask them to have another guess. If they enter the same value as compnum, display the message "Well done, you took [count] attempts".</p>
        <button onclick="let sol=document.getElementById('sol-049'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-049" style="display:none; margin-top:10px; background:var(--bg); padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">compnum = 50
guess = int(input("Can you guess the number I am thinking of? "))
count = 1
while guess != compnum:
    if guess < compnum:
        print("Too low")
    else:
        print("Too high")
    count = count + 1
    guess = int(input("Have another guess: "))
print("Well done, you took", count, "attempts")</div>
      </div>
    </div>

  `,

  // --- IDEA 3: SIDE-BY-SIDE DEBUGGING ---
  prac_debugging: `
    <h1>Fix the Bug: Code Tracing</h1>
    <p>Finding logic and syntax errors is a massive part of Paper 1. Read the broken code on the left, identify why it won't work, and type the working solution into the live console on the right.</p>

    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; background: var(--card-bg); padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
      <button onclick="showBugScenario(1)" style="padding: 8px 12px; background: var(--brand-surface); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">1. Infinite Loop</button>
      <button onclick="showBugScenario(2)" style="padding: 8px 12px; background: var(--brand-surface); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">2. Array Crash</button>
      <button onclick="showBugScenario(3)" style="padding: 8px 12px; background: var(--brand-surface); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">3. Syntax Error</button>
      <button onclick="showBugScenario(4)" style="padding: 8px 12px; background: var(--brand-surface); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">4. Out of Bounds</button>
      <button onclick="showBugScenario(5)" style="padding: 8px 12px; background: var(--brand-surface); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">5. Method Error</button>
      <button onclick="showBugScenario(6)" style="padding: 8px 12px; background: var(--brand-surface); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">6. Scope Logic</button>
      <button onclick="showBugScenario(7)" style="padding: 8px 12px; background: var(--brand-surface); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">7. Type Error</button>
      <button onclick="showBugScenario(8)" style="padding: 8px 12px; background: var(--brand-surface); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">8. Missing Return</button>
      <button onclick="showBugScenario(9)" style="padding: 8px 12px; background: var(--brand-surface); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">9. Range Logic</button>
      <button onclick="showBugScenario(10)" style="padding: 8px 12px; background: var(--brand-surface); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">10. Boolean Logic</button>
    </div>

    <div class="split-screen-container" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">
      
      <div style="flex: 1 1 400px; background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; border-left: 5px solid #dc3545; display: flex; flex-direction: column;">
        <h3 style="color: #dc3545; margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 10px;" id="bug-title">Scenario 1: Challenge 047</h3>
        <p style="font-size: 0.9rem; color: #aaa;" id="bug-context"><strong>Context:</strong> The program should keep asking for numbers and adding them to a total as long as the user types "y".</p>
        
        <div style="background: #000; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 0.95rem; overflow-x: auto; flex-grow: 1;">
          <code id="bug-code" style="color: #569cd6; line-height: 1.4;">
num1 = <span style="color:#4ec9b0;">int</span>(<span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter a number: "</span>))<br>
total = num1<br>
answer = <span style="color:#ce9178;">"y"</span><br>
<br>
<span style="color:#c586c0;">while</span> answer == <span style="color:#ce9178;">"y"</span>:<br>
&nbsp;&nbsp;&nbsp;&nbsp;num2 = <span style="color:#4ec9b0;">int</span>(<span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter another number: "</span>))<br>
&nbsp;&nbsp;&nbsp;&nbsp;total = total + num2<br>
<br>
<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"The total is"</span>, total)
          </code>
        </div>
        
        <button onclick="document.getElementById('bug-hint').style.display='block'" class="hint-btn" style="margin-top: 15px;">Give me a hint</button>
        <div id="bug-hint" class="hint-box" style="display: none; margin-top: 10px; font-size: 0.9rem;">
          <strong>Hint:</strong> Look closely at the while loop. Does the variable 'answer' ever change once the loop starts? What happens if a loop condition is always true?
        </div>
      </div>

      <div style="flex: 1 1 400px; border: 2px solid var(--pastel-violet); border-radius: 8px; overflow: hidden; background: #f9f9f9; display: flex; flex-direction: column;">
        <div style="background: var(--pastel-violet); color: var(--dark-purple); padding: 10px; font-size: 0.9rem; font-weight: bold; text-align: center;">
          Fix it here & run your code!
        </div>
        <iframe src="https://trinket.io/embed/python/3d8d7ce66b" width="100%" height="450" frameborder="0" allowfullscreen style="flex-grow: 1;"></iframe>
      </div>

    </div>

    <button onclick="goBack()" style="margin-top: 30px; padding: 10px 20px; background: var(--brand-surface); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
  `,

  binary_boss: `
    <div id="boss-difficulty-menu" class="fade-in">
        <h1 style="margin-bottom: 5px;">Binary Boss Battle</h1>
        <p style="opacity: 0.8; margin-bottom: 30px;">Test your conversion skills under pressure. The boss regenerates health based on how long you take to answer!</p>
        
        <h2 class="section-title">Select Intensity</h2>
        <div class="card-grid">
            <div class="wall-topic-card p2" onclick="startBossBattle('EASY')" style="border-left-color: var(--accent-green-text);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <div>
                    <h3>EASY</h3>
                    <span style="font-size: 0.8rem; opacity: 0.7;">4-bit Binary (100 HP)</span>
                </div>
            </div>
            
            <div class="wall-topic-card mix" onclick="startBossBattle('MEDIUM')" style="border-left-color: var(--accent-yellow);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <div>
                    <h3>MEDIUM</h3>
                    <span style="font-size: 0.8rem; opacity: 0.7;">Hex & 4-bit (300 HP)</span>
                </div>
            </div>
            
            <div class="wall-topic-card p1" onclick="startBossBattle('HARD')" style="border-left-color: var(--accent-red-text);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                <div>
                    <h3>HARD</h3>
                    <span style="font-size: 0.8rem; opacity: 0.7;">Hex & 8-bit (600 HP)</span>
                </div>
            </div>
        </div>
    </div>

    <div id="boss-battle-area" style="display: none;" class="fade-in">
        <h2 id="boss-topic-display" style="color: var(--text); margin-bottom: 20px;"></h2>
        
        <div id="boss-ui">
            <div id="boss-health-bg">
                <div id="boss-health-fill"></div>
            </div>
            <div id="boss-hp-text" style="color: var(--text); text-align: center; margin-top: 5px; font-weight: bold; font-family: monospace; font-size: 1.1rem;">100/100 HP</div>
        </div>

        <h2 id="boss-question-text" style="text-align: center; font-size: 2.2rem; margin: 30px 0; color: var(--text);"></h2>
        <div id="boss-options-container" style="display: flex; flex-direction: column; gap: 10px; max-width: 500px; margin: 0 auto;"></div>
        
        <div id="boss-feedback-area" style="text-align: center; margin: 20px 0; font-size: 1.2rem; min-height: 50px; font-weight: bold;"></div>
        
        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
            <div id="boss-continue-btn" class="wall-topic-card" onclick="nextBossQuestion()" style="display: none; border-left-color: var(--accent-green-text); padding: 10px 20px;">
                <h3 style="margin: 0;">Continue</h3>
            </div>
            <div class="wall-topic-card" onclick="loadContent('binary_boss')" style="display: inline-flex; border-left-color: var(--accent-red-text); padding: 10px 20px;">
                <h3 style="margin: 0;">← Flee Battle</h3>
            </div>
        </div>
    </div>
  `,

  quiz_trainer: `
    <div id="quiz-selection-menu" class="fade-in">
        <h1 style="margin-bottom: 5px;">Quiz Trainer</h1>
        <p style="opacity: 0.8; margin-bottom: 30px;">Test your knowledge. Earn XP. Level up.</p>
        
        <div class="card-grid" style="margin-bottom: 30px;">
            <div class="wall-topic-card mix" onclick="startQuizSession('MOCK_P1')" style="border-left-color: var(--accent-red-text);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <h3>Paper 1 Mock (30 Qs)</h3>
            </div>
            <div class="wall-topic-card mix" onclick="startQuizSession('MOCK_P2')" style="border-left-color: var(--accent-blue);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <h3>Paper 2 Mock (30 Qs)</h3>
            </div>
        </div>

        <h2 class="section-title">Paper 1 Topics</h2>
        <div id="quiz-grid-p1" class="card-grid"><!-- populated by populateQuizMenu() from questionBank --></div>

        <h2 class="section-title" style="margin-top: 30px;">Paper 2 Topics</h2>
        <div id="quiz-grid-p2" class="card-grid"><!-- populated by populateQuizMenu() from questionBank --></div>
    </div>

    <div id="quiz-active-area" style="display: none;" class="fade-in">
        <h2 id="quiz-topic-display" style="color: var(--text); margin-bottom: 5px; font-size: 1rem; opacity: 0.7; text-transform: uppercase;"></h2>
        <div id="quiz-timer" class="quiz-timer" style="display:none;">
          <span id="quiz-clock" class="quiz-clock">--:--</span>
          <span id="quiz-pace" class="quiz-pace on-pace">On pace</span>
        </div>
        
        <div id="quiz-progress-bg" style="width: 100%; height: 8px; background: rgba(128,128,128,0.2); border-radius: 4px; margin-bottom: 20px; overflow: hidden;">
            <div id="quiz-progress-fill" style="height: 100%; background: var(--accent-blue); width: 0%; transition: width 0.3s ease;"></div>
        </div>

        <h2 id="quiz-question-text" style="font-size: 1.6rem; margin: 30px 0; color: var(--text); min-height: 80px; display: flex; align-items: center;"></h2>
        
        <div id="quiz-options-container" style="display: flex; flex-direction: column; gap: 12px; max-width: 800px; margin: 0 auto;"></div>
        
        <div id="quiz-feedback-area" style="margin: 20px 0; font-size: 1.2rem; min-height: 30px; font-weight: bold; text-align: center;"></div>
        
        <div style="display: flex; gap: 15px; margin-top: 20px; justify-content: center;">
            <div id="quiz-continue-btn" class="wall-topic-card" onclick="nextQuizQuestion()" style="display: none; border-left-color: var(--accent-green-text); padding: 10px 20px;">
                <h3 style="margin: 0;">Continue</h3>
            </div>
            <div id="quiz-hint-btn" class="wall-topic-card" onclick="showQuizHint()" style="display: inline-flex; border-left-color: var(--accent-yellow); padding: 10px 20px;">
                <h3 style="margin: 0;">Hint</h3>
            </div>
            <div class="wall-topic-card" onclick="loadContent('quiz_trainer')" style="display: inline-flex; border-left-color: var(--accent-red-text); padding: 10px 20px;">
                <h3 style="margin: 0;">← Leave</h3>
            </div>
        </div>
    </div>
  `,

  parsons_puzzles: `
    <div id="parsons-selection-menu" class="fade-in">
        <h1 style="margin-bottom: 5px;">Parson's Puzzles</h1>
        <p style="opacity: 0.8; margin-bottom: 30px;">Reconstruct the code by dragging and dropping the blocks into the correct order. Earn XP for flawless logic!</p>
        
        <h2 class="section-title">Standard Puzzles (Python)</h2>
        <div class="card-grid">
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Basics')" style="border-left-color: var(--accent-blue);"><h3>Basics</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('If statements')" style="border-left-color: var(--accent-blue);"><h3>If statements</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Strings')" style="border-left-color: var(--accent-blue);"><h3>Strings</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Strings part 2')" style="border-left-color: var(--accent-blue);"><h3>Strings (part 2)</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Maths')" style="border-left-color: var(--accent-blue);"><h3>Maths</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Random')" style="border-left-color: var(--accent-blue);"><h3>Random</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('For loops')" style="border-left-color: var(--accent-blue);"><h3>For loops</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('While loops')" style="border-left-color: var(--accent-blue);"><h3>While loops</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Lists')" style="border-left-color: var(--accent-blue);"><h3>Lists</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Numeric Arrays')" style="border-left-color: var(--accent-blue);"><h3>Numeric arrays</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('2D lists')" style="border-left-color: var(--accent-blue);"><h3>2D lists</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Subprograms')" style="border-left-color: var(--accent-blue);"><h3>Subprograms</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Reading and writing to a text file')" style="border-left-color: var(--accent-blue);"><h3>Text files</h3></div>
        </div>

        <h2 class="section-title" style="margin-top: 35px;">Challenge Mode (Faded Inputs)</h2>
        <div class="card-grid">
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Basics', true)" style="border-left-color: var(--accent-red-text);"><h3>Basics (Hard)</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('If statements', true)" style="border-left-color: var(--accent-red-text);"><h3>If statements (Hard)</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Strings', true)" style="border-left-color: var(--accent-red-text);"><h3>Strings (Hard)</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Strings part 2', true)" style="border-left-color: var(--accent-red-text);"><h3>Strings (part 2) (Hard)</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Maths', true)" style="border-left-color: var(--accent-red-text);"><h3>Maths (Hard)</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Random', true)" style="border-left-color: var(--accent-red-text);"><h3>Random (Hard)</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('For loops', true)" style="border-left-color: var(--accent-red-text);"><h3>For loops (Hard)</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('While loops', true)" style="border-left-color: var(--accent-red-text);"><h3>While loops (Hard)</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Lists', true)" style="border-left-color: var(--accent-red-text);"><h3>Lists (Hard)</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Numeric Arrays', true)" style="border-left-color: var(--accent-red-text);"><h3>Numeric arrays (Hard)</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('2D lists', true)" style="border-left-color: var(--accent-red-text);"><h3>2D lists (Hard)</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Subprograms', true)" style="border-left-color: var(--accent-red-text);"><h3>Subprograms (Hard)</h3></div>
            <div class="wall-topic-card p1" onclick="startParsonsPuzzle('Reading and writing to a text file', true)" style="border-left-color: var(--accent-red-text);"><h3>Text files (Hard)</h3></div>
        </div>
    </div>

    <div id="parsons-active-area" style="display: none;" class="fade-in">
        <h2 id="parsons-topic-display" style="color: var(--text); margin-bottom: 5px; font-size: 1rem; opacity: 0.7; text-transform: uppercase;"></h2>
        
        <h2 id="parsons-question-text" style="font-size: 1.4rem; margin: 20px 0; color: var(--text); background: var(--card-bg); padding: 20px; border-radius: 8px; border: 1px solid var(--border);"></h2>

        <div class="parsons-layout" style="display: flex; gap: 20px; flex-wrap: wrap;">
            <div class="parsons-panel" style="flex: 1; min-width: 300px; background: var(--card-bg); padding: 15px; border-radius: 10px; border: 1px solid var(--border);">
                <h3 style="margin-top: 0; color: var(--accent-blue); border-bottom: 1px solid var(--border); padding-bottom: 10px;">Available Blocks</h3>
                <div id="parsons-source" class="parsons-dropzone" ondrop="parsonsDrop(event)" ondragover="parsonsAllowDrop(event)"></div>
            </div>

            <div class="parsons-panel" style="flex: 1; min-width: 300px; background: var(--card-bg); padding: 15px; border-radius: 10px; border: 1px solid var(--border);">
                <h3 style="margin-top: 0; color: var(--accent-green-text); border-bottom: 1px solid var(--border); padding-bottom: 10px;">Your Solution</h3>
                <div id="parsons-solution" class="parsons-dropzone" ondrop="parsonsDrop(event)" ondragover="parsonsAllowDrop(event)"></div>
            </div>
        </div>

        <div id="parsons-feedback" style="margin: 20px 0; font-size: 1.2rem; min-height: 30px; font-weight: bold; text-align: center;"></div>
        
        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
            <div class="wall-topic-card" onclick="loadContent('parsons_puzzles')" style="display: inline-flex; border-left-color: var(--accent-red-text); padding: 10px 20px;">
                <h3 style="margin: 0;">← Leave</h3>
            </div>
            <div class="wall-topic-card" id="parsons-check-btn" onclick="checkParsonsSolution()" style="display: inline-flex; border-left-color: var(--accent-green-text); padding: 10px 20px;">
                <h3 style="margin: 0;">Check Code</h3>
            </div>
        </div>
    </div>
  `,

  logic_gate_lab: `
    <div id="logic-lab-intro" class="fade-in">
        <h1 style="margin-bottom: 5px;">Logic Gate Lab</h1>
        <p style="opacity: 0.8; margin-bottom: 25px;">Complete truth tables, simplify Boolean expressions, and identify logic circuits. Earn <strong>+25 XP</strong> for each correct answer.</p>

        <h2 class="section-title">Gate Reference</h2>
        <div class="logic-ref-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); gap: 15px; margin-bottom: 30px;">
            <table class="logic-ref-table">
                <thead><tr><th colspan="2">AND (.)</th></tr></thead>
                <tbody>
                    <tr><td>0 . 0</td><td>0</td></tr>
                    <tr><td>0 . 1</td><td>0</td></tr>
                    <tr><td>1 . 0</td><td>0</td></tr>
                    <tr><td>1 . 1</td><td>1</td></tr>
                </tbody>
            </table>
            <table class="logic-ref-table">
                <thead><tr><th colspan="2">OR (+)</th></tr></thead>
                <tbody>
                    <tr><td>0 + 0</td><td>0</td></tr>
                    <tr><td>0 + 1</td><td>1</td></tr>
                    <tr><td>1 + 0</td><td>1</td></tr>
                    <tr><td>1 + 1</td><td>1</td></tr>
                </tbody>
            </table>
            <table class="logic-ref-table">
                <thead><tr><th colspan="2">NOT (¬)</th></tr></thead>
                <tbody>
                    <tr><td>¬0</td><td>1</td></tr>
                    <tr><td>¬1</td><td>0</td></tr>
                </tbody>
            </table>
        </div>

        <div style="display: flex; justify-content: center; gap: 15px;">
            <div class="wall-topic-card" onclick="startLogicGateLab()" style="display: inline-flex; border-left-color: var(--accent-green-text); padding: 10px 20px;">
                <h3 style="margin: 0;">Start Lab</h3>
            </div>
        </div>
    </div>

    <div id="logic-lab-active" style="display: none;" class="fade-in">
        <h2 id="logic-lab-progress" style="color: var(--text); margin-bottom: 5px; font-size: 1rem; opacity: 0.7; text-transform: uppercase;"></h2>

        <h2 id="logic-lab-question" style="font-size: 1.3rem; margin: 20px 0; color: var(--text); background: var(--card-bg); padding: 20px; border-radius: 8px; border: 1px solid var(--border);"></h2>

        <div id="logic-lab-body" style="background: var(--card-bg); padding: 20px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 20px;"></div>

        <div id="logic-lab-feedback" style="margin: 20px 0; font-size: 1.1rem; min-height: 30px; font-weight: bold; text-align: center;"></div>

        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px; flex-wrap: wrap;">
            <div class="wall-topic-card" onclick="loadContent('logic_gate_lab')" style="display: inline-flex; border-left-color: var(--accent-red-text); padding: 10px 20px;">
                <h3 style="margin: 0;">← Leave</h3>
            </div>
            <div id="logic-lab-check-btn" class="wall-topic-card" onclick="checkLogicLabTable()" style="display: none; border-left-color: var(--accent-blue); padding: 10px 20px;">
                <h3 style="margin: 0;">Check Table</h3>
            </div>
            <div id="logic-lab-continue-btn" class="wall-topic-card" onclick="nextLogicLabQuestion()" style="display: none; border-left-color: var(--accent-green-text); padding: 10px 20px;">
                <h3 style="margin: 0;">Continue</h3>
            </div>
        </div>
    </div>

    <div id="logic-lab-results" style="display: none;" class="fade-in" style="text-align: center;">
        <h1>Lab Complete!</h1>
        <p id="logic-lab-final" style="font-size: 1.2rem; margin: 20px 0;"></p>
        <div style="display: flex; justify-content: center; gap: 15px;">
            <div class="wall-topic-card" onclick="loadContent('logic_gate_lab')" style="display: inline-flex; border-left-color: var(--accent-green-text); padding: 10px 20px;">
                <h3 style="margin: 0;">Try Again</h3>
            </div>
        </div>
    </div>
  `,

};

// --- NEW: Page Dictionary for Search & Smart Back ---
const pageTitles = {
  'home': 'Dashboard', 'p1_hub': 'Paper 1 Hub', 'p2_hub': 'Paper 2 Hub', 'prac_hub': 'Practical Hub', 'resources': 'Revision Resources', 'visualizations': 'Visualizations Hub',
  'p1_algo': '3.1 Algorithms', 'p1_prog': '3.2 Programming', 'p2_data': '3.3 Data Representation', 'p2_sys': '3.4 Systems',
  'p2_net': '3.5 Networks', 'p2_cyber': '3.6 Cyber Security', 'p2_sql': '3.7 Databases', 'p2_impact': '3.8 Impacts',
  'p1_revision': 'P1 Flashcards', 'p2_revision': 'P2 Flashcards', 'prac_challenges': 'Coding Challenges',
  'act_io': 'I/O Activity', 'act_casting': 'Casting Activity', 'act_selection': 'Selection Activity', 'act_robust': 'Robustness Activity',
  'act_loops': 'Loops Activity', 'act_lists': 'Lists Activity', 'act_subroutines': 'Subroutines Activity', 'act_strings': 'Strings Activity',
  'p1_linear_viz': 'Linear Search Viz', 'p1_binary_viz': 'Binary Search Viz', 'p1_bubble_viz': 'Bubble Sort Viz', 'p1_merge_viz': 'Merge Sort Viz',
  'p2_rle_act': 'RLE Compression', 'p2_huffman_act': 'Huffman Tree Activity', 'p2_threat_viz': 'Cyber Threats Viz', 'p2_phish_game': 'Spot the Phish', 'p2_attack_viz': 'Technical Attacks Viz',
  'prac_challenges': 'Coding Challenges',
  'prac_debugging': 'Bug Fixer Activity',
  'prac_data_structs': 'Data Structures',
  'prac_string_manip': 'String Manipulation',
  'prac_core_constructs': 'Python Core Constructs',
  'prac_subroutines': 'Subroutines (Functions & Procedures)',
  'prac_file_handling': 'File Handling',
  'prac_validation': 'Robust Programs & Validation',
  'prac_modules': 'Built-in Modules Cheat Sheet',
  'logic_gate_lab': 'Logic Gate Lab',
  // These four are sidebar destinations. Without an entry here the browser tab
  // fell back to a bare "CS GCSE Hub", the Back button tooltip read "Previous
  // Page", and search results showed the raw page id (e.g. "binary_boss").
  'quiz_trainer': 'Quiz Trainer',
  'connecting_walls': 'Connecting Walls',
  'parsons_puzzles': "Parson's Puzzles",
  'binary_boss': 'Binary Boss Battle',
};

// --- BINARY BOSS BATTLE LOGIC ---
let bossHP = 100;
let bossMaxHP = 100;
let currentBossDifficulty = 'EASY';
let bossTimeWhenStarted = 0;
let bossWrongAnswers = 0;
let bossQuestions = [];
let currentBossIndex = 0;
// --- SIGNED STORAGE (discourages casual localStorage tampering) ---
const SIGN_SALT = 'csgcsehub_v1_9a8b7c6d5e4f';
function _fnv1aHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
function secureGetInt(key, fallback) {
  const val = localStorage.getItem(key);
  const sig = localStorage.getItem(key + '__s');
  if (val === null) return fallback;
  if (sig !== _fnv1aHash(String(val) + '|' + key + '|' + SIGN_SALT)) {
    localStorage.removeItem(key);
    localStorage.removeItem(key + '__s');
    return fallback;
  }
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : n;
}
function secureSetInt(key, value) {
  const v = String(value);
  localStorage.setItem(key, v);
  localStorage.setItem(key + '__s', _fnv1aHash(v + '|' + key + '|' + SIGN_SALT));
}
// NOTE: a previous migrateUnsigned() step re-signed any value whose signature was
// missing, which made the signature check trivially bypassable (delete the '__s'
// key, then write any value). It has been removed. Unsigned legacy values now
// fall back to 0, which is the same result tampering would have produced anyway.
// This check only deters casual editing — the salt ships in the source, so it is
// not, and cannot be, a real integrity guarantee for a purely client-side app.

// --- LEVELING SYSTEM STATE ---
let totalXP = secureGetInt('totalXP', 0);
// --- QUIZ TRAINER LOGIC ---
let activeQuizQuestions = [];
let activeQuizTopic = null;
// MOVE 01: questions missed this session, listed on the results screen.
let sessionMisses = [];

// ============================================================================
// DESIGN MOVE 04 -- TIMED MOCK PAPERS
// ============================================================================
// A mock is the closest thing here to sitting the real paper, and it was
// untimed. Running out of time is one of the commonest ways to lose marks and
// was the one thing the site gave no practice at. Topic quizzes stay untimed --
// those are for learning, not exam conditions.
const MOCK_DURATIONS = {         // seconds, from AQA's own paper lengths
  MOCK_P1: 2 * 60 * 60,          // Paper 1 -- 2h
  MOCK_P2: (1 * 60 + 45) * 60,   // Paper 2 -- 1h 45m
};

let quizTimerId = null;
let quizDeadline = 0;
let quizTimeLimit = 0;
let questionStartedAt = 0;
let questionTimes = [];

function startQuizTimer(mode) {
  stopQuizTimer();
  quizTimeLimit = MOCK_DURATIONS[mode] || 0;
  if (!quizTimeLimit) return;

  quizDeadline = Date.now() + quizTimeLimit * 1000;
  const host = document.getElementById('quiz-timer');
  if (host) host.style.display = 'flex';
  tickQuizTimer();
  quizTimerId = setInterval(tickQuizTimer, 1000);
}

function stopQuizTimer() {
  if (quizTimerId) clearInterval(quizTimerId);
  quizTimerId = null;
  const host = document.getElementById('quiz-timer');
  if (host) host.style.display = 'none';
}

function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

function tickQuizTimer() {
  const clock = document.getElementById('quiz-clock');
  const pace = document.getElementById('quiz-pace');
  if (!clock) return;

  const left = (quizDeadline - Date.now()) / 1000;
  clock.innerText = formatClock(left);
  clock.classList.toggle('urgent', left <= 300);

  // Pace: where you should be by now, against where you are.
  if (pace && activeQuizQuestions.length) {
    const used = quizTimeLimit - left;
    const expected = (used / quizTimeLimit) * activeQuizQuestions.length;
    // currentQuizIndex runs one ahead of the question on screen, and the first
    // tick happens before it renders, so clamp at zero rather than showing the
    // student a minute "behind" before they have read anything.
    const doneQs = Math.max(0, currentQuizIndex - 1);
    const diffQs = doneQs - expected;
    const perQuestion = quizTimeLimit / activeQuizQuestions.length;
    const mins = Math.round(Math.abs(diffQs) * perQuestion / 60);

    if (Math.abs(diffQs) < 0.75 || mins < 1) {
      pace.textContent = 'On pace';
      pace.className = 'quiz-pace on-pace';
    } else if (diffQs > 0) {
      pace.textContent = `${mins} min ahead`;
      pace.className = 'quiz-pace ahead';
    } else {
      pace.textContent = `${mins} min behind`;
      pace.className = 'quiz-pace behind';
    }
  }

  if (left <= 0) {
    stopQuizTimer();
    currentQuizIndex = activeQuizQuestions.length;    // force the results screen
    showQuizResults();
  }
}

// Shown on the results screen after a timed run.
function timedRunSummaryHTML() {
  if (!questionTimes.length || !quizTimeLimit) return '';
  const totalUsed = questionTimes.reduce((a, b) => a + b, 0);
  const avg = totalUsed / questionTimes.length;
  const slowest = questionTimes
    .map((t, i) => ({ t, i }))
    .sort((a, b) => b.t - a.t)
    .slice(0, 3)
    .filter(x => x.t > avg * 1.5);

  return `
    <div class="quiz-timing">
      <div class="qt-row"><span>Time used</span><b>${formatClock(totalUsed)}</b></div>
      <div class="qt-row"><span>Average per question</span><b>${formatClock(avg)}</b></div>
      ${slowest.length ? `<div class="qt-slow">Slowest: ${
        slowest.map(x => `Q${x.i + 1} (${formatClock(x.t)})`).join(', ')
      }</div>` : ''}
    </div>`;
}
let currentQuizIndex = 0;
let quizScore = 0;

// "3.2.10 Subroutines" must sort after "3.2.2 Programming Constructs".
// A plain string sort puts 3.2.10 before 3.2.2, so compare the numeric
// segments of the spec reference instead.
function compareSpecRefs(a, b) {
  const segs = s => (s.match(/^[\d.]+/) || [''])[0].split('.').filter(Boolean).map(Number);
  const A = segs(a), B = segs(b);
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    const d = (A[i] ?? -1) - (B[i] ?? -1);
    if (d) return d;
  }
  return a.localeCompare(b);
}

// The topic cards used to be 36 hand-written <div>s in the quiz_trainer page
// markup, which had to be kept in sync with questionBank by hand. They are
// generated from questionBank directly now, so adding a topic to the bank is
// enough to make it appear.
function populateQuizMenu() {
  const gridP1 = document.getElementById('quiz-grid-p1');
  const gridP2 = document.getElementById('quiz-grid-p2');

  // Safety check: Ensure the grids exist on the page before trying to fill them
  if (!gridP1 || !gridP2) return;

  const p1 = [], p2 = [];
  Object.keys(questionBank).sort(compareSpecRefs).forEach(topic => {
    const isP1 = topic.startsWith("3.1") || topic.startsWith("3.2");
    const m = getTopicMastery(topic);

    // Move 01: an attempted topic is coloured and barred by accuracy; an
    // untouched one keeps the neutral paper colour so the two read differently.
    const edge = m ? masteryBand(m.accuracy).colour
                   : (isP1 ? 'var(--accent-red)' : 'var(--accent-blue)');
    const meter = m
      ? `<div class="topic-meter" title="${m.correct} of ${m.seen} correct">
                    <div class="topic-meter-bar"><i style="width:${m.accuracy}%; background:${edge};"></i></div>
                    <span class="topic-meter-pct">${m.accuracy}%</span>
                 </div>`
      : `<div class="topic-meter"><span class="topic-meter-new">Not started</span></div>`;

    (isP1 ? p1 : p2).push(`
            <div class="wall-topic-card ${isP1 ? 'p1' : 'p2'}" onclick="startQuizSession('${topic.replace(/'/g, "\\'")}')" style="border-left-color: ${edge};">
                <div style="flex:1; min-width:0;">
                  <h3>${escapeHtml(topic)}</h3>
                  ${meter}
                </div>
            </div>`);
  });

  gridP1.innerHTML = p1.join('');
  gridP2.innerHTML = p2.join('');

  // The MutationObserver would catch these too, but it runs asynchronously;
  // enhancing here means the cards are keyboard-ready the moment they exist.
  enhanceRenderedPage(gridP1);
  enhanceRenderedPage(gridP2);
}

function startQuizSession(mode) {
  document.getElementById('quiz-selection-menu').style.display = 'none';
  document.getElementById('quiz-active-area').style.display = 'block';

  quizScore = 0;
  currentQuizIndex = 0;
  sessionMisses = [];
  questionTimes = [];

  // Move 01: mocks span a whole paper, so only topic sessions update mastery.
  activeQuizTopic = mode.startsWith('MOCK_') ? null : mode;

  let isTest = mode.startsWith('MOCK_');
  if (isTest) {
    let filtered = [];
    Object.keys(questionBank).forEach(t => {
      let isP1 = t.startsWith("3.1") || t.startsWith("3.2");
      if ((mode === 'MOCK_P1' && isP1) || (mode === 'MOCK_P2' && !isP1)) {
        filtered = filtered.concat(examinableQuestions(questionBank[t]));
      }
    });
    document.getElementById('quiz-topic-display').innerText = mode === 'MOCK_P1' ? "PAPER 1 MOCK" : "PAPER 2 MOCK";
    // A paper spans every topic in it, so the same question appearing in two
    // topics could otherwise be drawn twice into one mock.
    const seenText = new Set();
    filtered = filtered.filter(q => !seenText.has(q.q) && seenText.add(q.q));
    activeQuizQuestions = filtered.sort(() => 0.5 - Math.random()).slice(0, MOCK_LENGTH);
  } else {
    // Each topic holds a bank of 30+ questions; a session draws 10 at random,
    // so the same topic stays worth revisiting.
    activeQuizQuestions = examinableQuestions(questionBank[mode])
      .sort(() => 0.5 - Math.random())
      .slice(0, QUIZ_LENGTH);
    document.getElementById('quiz-topic-display').innerText = `TOPIC: ${mode}`;
  }
  startQuizTimer(mode);   // move 04: no-op for topic quizzes
  nextQuizQuestion();
}

function nextQuizQuestion() {
  if (currentQuizIndex >= activeQuizQuestions.length) {
    showQuizResults();
    return;
  }

  const qData = activeQuizQuestions[currentQuizIndex];
  document.getElementById('quiz-question-text').innerText = qData.q;
  document.getElementById('quiz-feedback-area').innerHTML = '';
  document.getElementById('quiz-continue-btn').style.display = 'none';
  document.getElementById('quiz-hint-btn').disabled = false;
  document.getElementById('quiz-hint-btn').style.opacity = '1';

  // Update Progress Bar
  document.getElementById('quiz-progress-fill').style.width = `${((currentQuizIndex + 1) / activeQuizQuestions.length) * 100}%`;

  const container = document.getElementById('quiz-options-container');
  container.innerHTML = '';
  // Lettered A-D and left-aligned, so the four options share a common left edge
  // and can be read down like a list rather than compared as centred blocks.
  // The option text lives in its own element and on a data attribute, so the
  // letter can never leak into an answer comparison.
  [...qData.options].sort(() => 0.5 - Math.random()).forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.dataset.option = opt;

    const letter = document.createElement('span');
    letter.className = 'opt-letter';
    letter.setAttribute('aria-hidden', 'true');   // the label already reads the text
    letter.textContent = 'ABCD'[i] || String(i + 1);

    const text = document.createElement('span');
    text.className = 'opt-text';
    text.textContent = opt;

    btn.append(letter, text);
    btn.onclick = () => handleQuizAnswer(btn, opt, qData);
    container.appendChild(btn);
  });

  questionStartedAt = Date.now();
  currentQuizIndex++;
}

function handleQuizAnswer(clickedBtn, choice, qData) {
  const isCorrect = (choice === qData.a);
  recordTopicAnswer(activeQuizTopic, isCorrect);

  if (questionStartedAt) questionTimes.push((Date.now() - questionStartedAt) / 1000);

  // Move 01: keep what was missed, so the results screen can explain it.
  if (!isCorrect) {
    sessionMisses.push({ q: qData.q, chosen: choice, answer: qData.a, why: qData.why, question: qData });
  }
  const btns = document.querySelectorAll('.quiz-option-btn');
  const feedback = document.getElementById('quiz-feedback-area');

  btns.forEach(b => {
    b.disabled = true;
    const value = b.dataset.option;          // never b.innerText: that includes the letter
    if (value === qData.a) b.classList.add('is-correct');
    else if (value === choice) b.classList.add('is-wrong');
  });

  if (isCorrect) {
    quizScore++;
    updateXP(10); // <-- Instantly awards 10 XP and updates the header!

    feedback.innerHTML = `<span style="color: var(--accent-green-text);">Correct!</span> <span style="font-weight: normal; font-size: 1rem; color: var(--text-light);">${qData.why}</span> <br><span style="color: var(--accent-green-text); font-size: 1.1rem; font-weight: bold; margin-top: 5px; display: inline-block;">+10 XP</span>`;
  } else {
    feedback.innerHTML = `<span style="color: var(--accent-red-text);">Incorrect.</span> <span style="font-weight: normal; font-size: 1rem; color: var(--text-light);">${qData.why}</span>`;
  }

  document.getElementById('quiz-continue-btn').style.display = 'inline-flex';
  document.getElementById('quiz-hint-btn').style.opacity = '0.3';
}

function showQuizHint() {
  const btn = document.getElementById('quiz-hint-btn');
  if (btn.style.opacity === '0.3') return; // Disabled

  const qData = activeQuizQuestions[currentQuizIndex - 1];
  const buttons = Array.from(document.querySelectorAll('.quiz-option-btn'));
  const wrongButtons = buttons.filter(b => b.dataset.option !== qData.a && !b.classList.contains('is-eliminated'));

  // Eliminating a wrong answer only helps if a real choice is left afterwards.
  // A few questions are True/False, where removing the single wrong option would
  // hand over the answer outright -- those get the written hint on its own.
  if (buttons.length > 2 && wrongButtons.length > 0) {
    const target = wrongButtons[Math.floor(Math.random() * wrongButtons.length)];
    target.classList.add('is-eliminated');
    target.disabled = true;
  }

  document.getElementById('quiz-feedback-area').innerHTML =
    `<span style="color: var(--accent-yellow-text);">Hint: ${escapeHtml(qData.hint || '')}</span>`;
  btn.style.opacity = '0.3'; // Disable hint button after use
}

function showQuizResults() {
  const area = document.getElementById('quiz-active-area');
  const total = activeQuizQuestions.length;
  const accuracy = ((quizScore / total) * 100).toFixed(1);

  incrementAchievement('quizzes');

  let totalXPEarned = quizScore * 10;
  // NOTE: We removed updateXP() from here so they don't double-dip!

  // MOVE 01 -- answer review. Every question carries a written explanation that
  // previously flashed past for a couple of seconds and was then gone. The
  // questions actually missed are the point of the session, so they are listed
  // here with the right answer and the reason.
  const missed = sessionMisses.slice();
  const reviewHTML = missed.length ? `
        <div class="quiz-review">
          <h2 class="quiz-review-head">Worth another look
            <span class="quiz-review-count">${missed.length}</span>
          </h2>
          ${missed.map(m => `
            <div class="quiz-review-item">
              <div class="qr-q">${escapeHtml(m.q)}</div>
              <div class="qr-yours"><span class="qr-tag qr-tag-wrong">You said</span> ${escapeHtml(m.chosen)}</div>
              <div class="qr-right"><span class="qr-tag qr-tag-right">Answer</span> ${escapeHtml(m.answer)}</div>
              ${m.why ? `<div class="qr-why">${escapeHtml(m.why)}</div>` : ''}
            </div>`).join('')}
          <button class="quiz-retry-btn" onclick="retryMissedQuestions()">
            Retry just these ${missed.length} &rarr;
          </button>
        </div>` : `
        <p class="quiz-allright">Nothing missed &mdash; every answer correct.</p>`;

  area.innerHTML = `
        <div class="quiz-results">
            <h1 class="quiz-results-title">Session Complete</h1>
            <p class="quiz-results-score">You scored <b>${quizScore}</b> out of <b>${total}</b></p>
            <p class="quiz-results-score">Accuracy: <b>${accuracy}%</b></p>
            <p class="quiz-results-xp">Total Earned: +${totalXPEarned} XP</p>
            ${timedRunSummaryHTML()}
            ${reviewHTML}
            <div class="wall-topic-card" onclick="loadContent('quiz_trainer')" style="display: inline-flex; margin-top: 30px; border-left-color: var(--accent-blue);">
                <h3 style="margin: 0;">Return to Menu</h3>
            </div>
        </div>
    `;
  stopQuizTimer();
}

// Re-runs only the questions missed, keeping the same topic for mastery.
// The results screen has replaced the quiz markup by this point, so the page
// is re-rendered first and the retry set carried across.
function retryMissedQuestions() {
  const retry = sessionMisses.map(m => m.question).filter(Boolean);
  if (!retry.length) return;

  const topic = activeQuizTopic;
  loadContent('quiz_trainer');          // restores quiz-active-area and its children

  document.getElementById('quiz-selection-menu').style.display = 'none';
  document.getElementById('quiz-active-area').style.display = 'block';

  quizScore = 0;
  currentQuizIndex = 0;
  sessionMisses = [];
  questionTimes = [];
  activeQuizTopic = topic;              // loadContent does not clear it, but be explicit
  activeQuizQuestions = retry.sort(() => 0.5 - Math.random());
  document.getElementById('quiz-topic-display').innerText =
    topic ? `RETRY: ${topic}` : 'RETRY';
  nextQuizQuestion();
}

// Rank thresholds
const getRank = (level) => {
  if (level >= 75) return { name: "S", color: "var(--accent-yellow)" };
  if (level >= 60) return { name: "A", color: "var(--accent-green)" };
  if (level >= 45) return { name: "B", color: "var(--accent-blue)" };
  if (level >= 30) return { name: "C", color: "#9b59b6" };
  if (level >= 15) return { name: "D", color: "#e67e22" };
  return { name: "F", color: "#95a5a6" }; // Default
};

// Calculates current level and progress to next level
const getLevelData = (xp) => {
  let level = 1;
  let xpRequiredForNext = 100; // XP needed for LVL 2
  let tempXP = xp;

  while (tempXP >= xpRequiredForNext) {
    tempXP -= xpRequiredForNext;
    level++;
    xpRequiredForNext = Math.floor(xpRequiredForNext * 1.1); // 10% increase per level
  }
  return { level, currentLevelXP: tempXP, nextLevelXP: xpRequiredForNext };
};

// --- ACHIEVEMENTS ---
function getAchievementCount(key) {
  return secureGetInt('ach-' + key, 0);
}

function incrementAchievement(key) {
  const next = getAchievementCount(key) + 1;
  secureSetInt('ach-' + key, next);
  updateAchievementsUI();
}

function updateAchievementsUI() {
  ['quizzes', 'walls', 'bosses'].forEach(key => {
    const el = document.getElementById('ach-' + key);
    if (el) el.innerText = getAchievementCount(key);
  });
}

// Adds XP, saves it, and updates the top right header
function updateXP(amount) {
  totalXP += amount;
  secureSetInt('totalXP', totalXP);
  updateGlobalUI();
}

// Visually updates the new dashboard header
function updateGlobalUI() {
  updateStreakUI();
  const data = getLevelData(totalXP);
  const rank = getRank(data.level);

  const rankBadge = document.getElementById('rank-badge');
  const levelNum = document.getElementById('level-num');
  const xpBar = document.getElementById('xp-bar-fill');

  if (rankBadge) {
    rankBadge.innerText = rank.name;
    rankBadge.style.color = rank.color;
  }
  if (levelNum) {
    levelNum.innerText = data.level;
  }
  if (xpBar) {
    xpBar.style.width = `${(data.currentLevelXP / data.nextLevelXP) * 100}%`;
  }

  updateAchievementsUI();
}

function startBossBattle(difficulty) {
  document.getElementById('boss-difficulty-menu').style.display = 'none';
  document.getElementById('boss-battle-area').style.display = 'block';

  currentBossDifficulty = difficulty;
  bossWrongAnswers = 0;
  currentBossIndex = 0;

  bossMaxHP = (difficulty === 'EASY') ? 100 : (difficulty === 'MEDIUM' ? 300 : 600);
  bossHP = bossMaxHP;

  document.getElementById('boss-topic-display').innerText = `BOSS BATTLE: ${difficulty}`;
  document.getElementById('boss-feedback-area').innerHTML = '';
  document.getElementById('boss-continue-btn').style.display = 'none';

  // Generate 30 dynamic questions
  bossQuestions = [];
  const padding = (difficulty === 'HARD') ? 8 : 4;
  for (let i = 0; i < 30; i++) {
    let val = Math.floor(Math.random() * (padding === 8 ? 256 : 16));
    let isHexQ = (difficulty !== 'EASY' && Math.random() > 0.4);
    bossQuestions.push({
      q: isHexQ ? `CONVERT HEX: ${val.toString(16).toUpperCase()}` : `CONVERT BINARY: ${val.toString(2).padStart(padding, '0')}`,
      a: isHexQ ? val.toString(2).padStart(padding, '0') : val.toString(),
      options: generateBossOptions(val, isHexQ, padding)
    });
  }
  updateBossUI();
  nextBossQuestion();
}

function updateBossUI() {
  const fill = document.getElementById('boss-health-fill');
  const hpText = document.getElementById('boss-hp-text');
  let percentage = Math.max(0, (bossHP / bossMaxHP) * 100);
  fill.style.width = `${percentage}%`;
  hpText.innerText = `${bossHP} / ${bossMaxHP} HP`;
}

function generateBossOptions(correctVal, isHexQ, padding) {
  let opts = new Set();
  opts.add(isHexQ ? correctVal.toString(2).padStart(padding, '0') : correctVal.toString());

  while (opts.size < 4) {
    let fakeVal = Math.max(0, correctVal + (Math.floor(Math.random() * 10) - 5));
    if (fakeVal === correctVal) fakeVal += 1;
    let formattedFake = isHexQ ? fakeVal.toString(2).padStart(padding, '0') : fakeVal.toString();
    opts.add(formattedFake);
  }
  return Array.from(opts).sort(() => 0.5 - Math.random());
}

function nextBossQuestion() {
  if (currentBossIndex >= bossQuestions.length) {
    bossVictorySequence(false); // Ran out of questions
    return;
  }

  const qData = bossQuestions[currentBossIndex];
  document.getElementById('boss-question-text').innerText = qData.q;
  document.getElementById('boss-feedback-area').innerHTML = '';
  document.getElementById('boss-continue-btn').style.display = 'none';

  const container = document.getElementById('boss-options-container');
  container.innerHTML = '';

  qData.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'boss-option-btn';
    // The option value lives on the element, not in its rendered text, so
    // adding a badge or an icon later cannot break answer matching.
    btn.dataset.option = opt;
    btn.textContent = opt;
    btn.onclick = () => handleBossAnswer(btn, opt, qData.a);
    container.appendChild(btn);
  });

  bossTimeWhenStarted = Date.now();
  currentBossIndex++;
}

function handleBossAnswer(clickedBtn, choice, correct) {
  const isCorrect = (choice === correct);
  const btns = document.querySelectorAll('.boss-option-btn');
  const feedback = document.getElementById('boss-feedback-area');
  const timeTaken = (Date.now() - bossTimeWhenStarted) / 1000;

  btns.forEach(b => {
    b.disabled = true;
    const value = b.dataset.option;        // never b.innerText
    if (value === correct) b.classList.add('is-correct');
    else if (value === choice) b.classList.add('is-wrong');
  });

  if (isCorrect) {
    // Punish slow answers by making the boss regenerate health
    let multiplier = currentBossDifficulty === 'HARD' ? 5 : (currentBossDifficulty === 'MEDIUM' ? 2.5 : 1);
    let regen = Math.max(1, Math.floor(timeTaken * multiplier));

    bossHP -= 25;

    if (bossHP <= 0) {
      bossHP = 0;
      feedback.innerHTML = `<span style="color: var(--accent-green-text);">FATAL BLOW! Boss Defeated!</span>`;
      updateBossUI();
      setTimeout(() => bossVictorySequence(true), 1500);
      return;
    } else {
      bossHP = Math.min(bossMaxHP, bossHP + regen);
      feedback.innerHTML = `<span style="color: var(--accent-green-text);">HIT! -25 HP.</span> <br><span style="color: var(--accent-red-text); font-size: 0.9rem;">Boss regenerated ${regen} HP because you took ${Math.floor(timeTaken)}s to answer.</span>`;
      updateBossUI();
    }
  } else {
    bossWrongAnswers++;
    let missHeal = currentBossDifficulty === 'HARD' ? 40 : (currentBossDifficulty === 'MEDIUM' ? 30 : 20);
    bossHP = Math.min(bossMaxHP, bossHP + missHeal);
    feedback.innerHTML = `<span style="color: var(--accent-red-text);">MISS! Boss healed +${missHeal} HP!</span>`;
    updateBossUI();
  }

  document.getElementById('boss-continue-btn').style.display = 'inline-flex';
}

function bossVictorySequence(won) {
  const area = document.getElementById('boss-battle-area');
  if (won) {
    // Calculate XP based on difficulty
    let xpReward = 50;
    if (currentBossDifficulty === 'MEDIUM') xpReward = 75;
    if (currentBossDifficulty === 'HARD') xpReward = 100;

    updateXP(xpReward); // Award the XP!
    incrementAchievement('bosses');

    const accuracy = ((currentBossIndex - bossWrongAnswers) / currentBossIndex) * 100;
    area.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h1 style="color: var(--accent-yellow); font-size: 3rem; margin-bottom: 0;">VICTORY</h1>
                <h2 style="color: var(--text);">The Boss is Defeated!</h2>
                <p style="font-size: 1.2rem; color: var(--text);">Accuracy: <b>${accuracy.toFixed(1)}%</b></p>
                
                <p style="color: var(--accent-green-text); font-size: 1.5rem; font-weight: bold; margin: 15px 0;">+${xpReward} XP</p>
                
                <p style="color: var(--text-light);">Questions Answered: ${currentBossIndex} | Errors: ${bossWrongAnswers}</p>
                <div class="wall-topic-card" onclick="loadContent('binary_boss')" style="display: inline-flex; margin-top: 30px; border-left-color: var(--accent-blue);">
                    <h3 style="margin: 0;">Return to Menu</h3>
                </div>
            </div>
        `;
  } else {
    area.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h1 style="color: var(--accent-red-text); font-size: 3rem; margin-bottom: 0;">DEFEAT</h1>
                <h2 style="color: var(--text);">You ran out of questions!</h2>
                <p style="font-size: 1.2rem; color: var(--text);">The boss survived your barrage of answers.</p>
                <p style="color: var(--text-light);">The boss still had ${bossHP} HP remaining.</p>
                <div class="wall-topic-card" onclick="loadContent('binary_boss')" style="display: inline-flex; margin-top: 30px; border-left-color: var(--accent-blue);">
                    <h3 style="margin: 0;">Try Again</h3>
                </div>
            </div>
        `;
  }
};

// --- NEW: Debugging Scenario Logic ---
function showBugScenario(num) {
  document.getElementById('bug-hint').style.display = 'none';

  const title = document.getElementById('bug-title');
  const context = document.getElementById('bug-context');
  const code = document.getElementById('bug-code');
  const hint = document.getElementById('bug-hint');

  switch (num) {
    case 1:
      title.innerText = "Scenario 1: Infinite Loop";
      context.innerHTML = '<strong>Context:</strong> The program should keep asking for numbers and adding them to a total as long as the user types "y".';
      code.innerHTML = 'num1 = <span style="color:#4ec9b0;">int</span>(<span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter a number: "</span>))<br>total = num1<br>answer = <span style="color:#ce9178;">"y"</span><br><br><span style="color:#c586c0;">while</span> answer == <span style="color:#ce9178;">"y"</span>:<br>&nbsp;&nbsp;&nbsp;&nbsp;num2 = <span style="color:#4ec9b0;">int</span>(<span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter another number: "</span>))<br>&nbsp;&nbsp;&nbsp;&nbsp;total = total + num2<br><br><span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"The total is"</span>, total)';
      hint.innerHTML = "<strong>Hint:</strong> Look closely at the while loop. Does the variable 'answer' ever change once the loop starts? What happens if a loop condition is always true?";
      break;
    case 2:
      title.innerText = "Scenario 2: The Array Crash";
      context.innerHTML = '<strong>Context:</strong> Create an array of five numbers. Ask the user for a number. Divide each number in the array by the user\'s number.';
      code.innerHTML = 'nums = [10.50, 20.25, 30.00, 40.75, 50.10]<br><br>divisor = <span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter a number: "</span>)<br><br><span style="color:#c586c0;">for</span> i <span style="color:#c586c0;">in</span> <span style="color:#4ec9b0;">range</span>(0, 5):<br>&nbsp;&nbsp;&nbsp;&nbsp;ans = nums[i] / divisor<br>&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#4ec9b0;">round</span>(ans, 2))';
      hint.innerHTML = "<strong>Hint:</strong> There are two massive errors here. First, what data type does <code>input()</code> return by default? Second, you can't divide a float by a string!";
      break;
    case 3:
      title.innerText = "Scenario 3: Selection Syntax Error";
      context.innerHTML = '<strong>Context:</strong> Ask for a number. If it\'s over 100, say "High". If it\'s exactly 100, say "Spot on".';
      code.innerHTML = 'num = <span style="color:#4ec9b0;">int</span>(<span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter a number: "</span>))<br><span style="color:#c586c0;">if</span> num > 100:<br>&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"High"</span>)<br><span style="color:#c586c0;">elif</span> num = 100:<br>&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Spot on"</span>)';
      hint.innerHTML = "<strong>Hint:</strong> Look at the <code>elif</code> line. Are you *comparing* the number to 100, or trying to *assign* the number to 100? Remember the difference between <code>=</code> and <code>==</code>.";
      break;
    case 4:
      title.innerText = "Scenario 4: Array Index Out of Bounds";
      context.innerHTML = '<strong>Context:</strong> Create an array of 5 names. Print them out one by one using a FOR loop.';
      code.innerHTML = 'names = [<span style="color:#ce9178;">"Ali"</span>, <span style="color:#ce9178;">"Ben"</span>, <span style="color:#ce9178;">"Cyd"</span>, <span style="color:#ce9178;">"Dan"</span>, <span style="color:#ce9178;">"Eve"</span>]<br><br><span style="color:#c586c0;">for</span> i <span style="color:#c586c0;">in</span> <span style="color:#4ec9b0;">range</span>(1, 6):<br>&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(names[i])';
      hint.innerHTML = "<strong>Hint:</strong> Arrays are zero-indexed! The first item is at index 0. This loop starts at 1 and tries to reach index 5. Does index 5 exist?";
      break;
    case 5:
      title.innerText = "Scenario 5: Method Error";
      context.innerHTML = '<strong>Context:</strong> Ask the user to type "yes". Convert it to lowercase and check if it matches.';
      code.innerHTML = 'ans = <span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Type yes: "</span>)<br>ans = ans.lower<br><span style="color:#c586c0;">if</span> ans == <span style="color:#ce9178;">"yes"</span>:<br>&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Agreed"</span>)';
      hint.innerHTML = "<strong>Hint:</strong> <code>.lower</code> is a built-in method (like a function). What characters do you always need to put at the end of a method to actually run it?";
      break;
    case 6:
      title.innerText = "Scenario 6: Scope Logic Error";
      context.innerHTML = '<strong>Context:</strong> Ask for 3 numbers, add them up, and print the final running total.';
      code.innerHTML = '<span style="color:#c586c0;">for</span> i <span style="color:#c586c0;">in</span> <span style="color:#4ec9b0;">range</span>(3):<br>&nbsp;&nbsp;&nbsp;&nbsp;total = 0<br>&nbsp;&nbsp;&nbsp;&nbsp;num = <span style="color:#4ec9b0;">int</span>(<span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Num: "</span>))<br>&nbsp;&nbsp;&nbsp;&nbsp;total = total + num<br><br><span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Total is"</span>, total)';
      hint.innerHTML = "<strong>Hint:</strong> Look at where <code>total = 0</code> is placed. What happens to your running total every single time the loop repeats?";
      break;
    case 7:
      title.innerText = "Scenario 7: Type Concatenation Error";
      context.innerHTML = '<strong>Context:</strong> Ask for two numbers, add them together, and display the answer.';
      code.innerHTML = 'num1 = <span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter number 1: "</span>)<br>num2 = <span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter number 2: "</span>)<br>ans = num1 + num2<br><span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"The total is"</span>, ans)';
      hint.innerHTML = "<strong>Hint:</strong> By default, <code>input()</code> brings in text (strings). What happens if you add the string '5' and the string '5'? You need to cast them first!";
      break;
    case 8:
      title.innerText = "Scenario 8: Subroutine Missing Return";
      context.innerHTML = '<strong>Context:</strong> A function that doubles a number and sends it back to the main program to be printed.';
      code.innerHTML = '<span style="color:#c586c0;">def</span> <span style="color:#dcdcaa;">double_num</span>(x):<br>&nbsp;&nbsp;&nbsp;&nbsp;ans = x * 2<br><br>result = <span style="color:#dcdcaa;">double_num</span>(4)<br><span style="color:#dcdcaa;">print</span>(result)';
      hint.innerHTML = "<strong>Hint:</strong> The function calculates the answer, but it never sends it back to the main program, which is why it prints 'None'. Look for a missing keyword at the end of the function.";
      break;
    case 9:
      title.innerText = "Scenario 9: For Loop Range Logic";
      context.innerHTML = '<strong>Context:</strong> Print the 5 times table from 1 x 5 all the way up to 12 x 5.';
      code.innerHTML = '<span style="color:#c586c0;">for</span> i <span style="color:#c586c0;">in</span> <span style="color:#4ec9b0;">range</span>(1, 12):<br>&nbsp;&nbsp;&nbsp;&nbsp;ans = i * 5<br>&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(i, <span style="color:#ce9178;">"x 5 ="</span>, ans)';
      hint.innerHTML = "<strong>Hint:</strong> The <code>range(start, stop)</code> function stops *before* the stop number. If you want it to actually reach 12, what should the stop number be?";
      break;
    case 10:
      title.innerText = "Scenario 10: Boolean Logic Error";
      context.innerHTML = '<strong>Context:</strong> Check if a user\'s inputted colour is either red or blue.';
      code.innerHTML = 'col = <span style="color:#dcdcaa;">input</span>(<span style="color:#ce9178;">"Enter colour: "</span>)<br><span style="color:#c586c0;">if</span> col == <span style="color:#ce9178;">"red"</span> <span style="color:#c586c0;">or</span> <span style="color:#ce9178;">"blue"</span>:<br>&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#dcdcaa;">print</span>(<span style="color:#ce9178;">"Valid primary colour"</span>)';
      hint.innerHTML = "<strong>Hint:</strong> A string like <code>\'blue\'</code> on its own is always evaluated as True by Python. You have to explicitly state the variable being compared on *both* sides of the <code>or</code>.";
      break;
  }
}

// --- History Management Variables ---
// Navigation is driven by the real browser history (pushState + #hash), so the
// device Back button/gesture steps back through the app instead of leaving it,
// and every page is bookmarkable and shareable. historyStack mirrors that
// history purely so the floating Back button can name its destination.
let historyStack = [];
let navDepth = 0;
let searchIndex = [];
let contentIndex = [];

// --- PER-PAGE STATE ---
//
// loadContent() replaces #display-area wholesale, but the activity counters and
// in-flight animations live in module scope and used to survive that. The
// symptoms: "Spot the Phish" declared victory after 2 clicks because phishCount
// carried over from a previous visit, and leaving mid-sort left isSorting stuck
// true so the Start button became a silent no-op.
//
// pageEpoch is bumped on every navigation. Long-running async activities
// capture it and bail out as soon as it changes, so an animation whose page has
// been torn down stops instead of animating detached nodes.
let pageEpoch = 0;
let dosAttackInterval = null;

function resetPageState() {
  pageEpoch++;

  phishCount = 0;      // Spot the Phish progress
  isSorting = false;   // Bubble sort re-entry guard

  if (dosAttackInterval) {
    clearInterval(dosAttackInterval);
    dosAttackInterval = null;
  }
}

// Reduce a page's HTML to searchable plain text.
// A textarea decodes every HTML entity (&mdash;, &times;, &#8209; ...) without
// running any markup, so snippets never show raw entity names.
const entityDecoder = document.createElement('textarea');

function stripHtml(html) {
  entityDecoder.innerHTML = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return entityDecoder.value
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function buildSearchIndex() {
  searchIndex = [];
  // 1. Add Topics
  for (const [id, title] of Object.entries(pageTitles)) {
    searchIndex.push({ title: title, desc: "Hub Page / Topic", id: id, type: "Topic" });
  }
  // 2. Add P1 Flashcards
  p1_cards.forEach(c => searchIndex.push({ title: c.term, desc: c.def, id: "p1_revision", type: "P1 Keyword" }));
  // 3. Add P2 Flashcards
  p2_cards.forEach(c => searchIndex.push({ title: c.term, desc: c.def, id: "p2_revision", type: "P2 Keyword" }));

  // 4. Add the body text of every page. Without this the index only covered
  // page titles and the two flashcard decks, so terms explained inside a page
  // ("Von Neumann", "fetch-decode-execute") returned no results at all.
  contentIndex = Object.entries(contentData).map(([id, html]) => {
    const text = stripHtml(html);
    return { id, title: pageTitles[id] || id, text, lower: text.toLowerCase() };
  });
}

// Run on boot
window.addEventListener('DOMContentLoaded', () => {
  buildSearchIndex();

  // Initialize Dark Mode based on LocalStorage
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
});

// --- NEW: Global Search Function ---
function handleSearch() {
  const query = document.getElementById('global-search').value.toLowerCase();
  const resultsDiv = document.getElementById('search-results');

  const searchBox = document.getElementById('global-search');
  const setExpanded = open => searchBox.setAttribute('aria-expanded', open ? 'true' : 'false');

  if (!query) {
    resultsDiv.style.display = 'none';
    setExpanded(false);
    return;
  }

  // Titles and flashcard definitions first — these are the most precise hits.
  const matches = searchIndex.filter(item =>
    item.title.toLowerCase().includes(query) ||
    (item.desc && item.desc.toLowerCase().includes(query))
  ).slice(0, 6);

  // Then fall back to the body text of each page, skipping pages already
  // represented above, and quote the sentence fragment the term appears in.
  const alreadyListed = new Set(matches.map(m => m.id));
  const pageHits = [];
  for (const page of contentIndex) {
    if (matches.length + pageHits.length >= 8) break;
    if (alreadyListed.has(page.id)) continue;

    const at = page.lower.indexOf(query);
    if (at === -1) continue;

    const from = Math.max(0, at - 40);
    const snippet = (from > 0 ? '…' : '') +
      page.text.substring(from, at + query.length + 60).trim() + '…';
    pageHits.push({ title: page.title, desc: snippet, id: page.id, type: 'On this page' });
  }

  const results = matches.concat(pageHits);

  if (results.length > 0) {
    resultsDiv.innerHTML = results.map(m =>
      `<div onclick="executeSearch('${m.id}')" role="option" tabindex="0">
          <strong style="color: var(--dark-purple);">${escapeHtml(m.title)}</strong> <span style="font-size: 0.8rem; color: var(--text-light); background: var(--bg); border: 1px solid var(--border); padding: 2px 5px; border-radius: 4px; margin-left: 5px;">${m.type}</span>
          ${m.desc ? `<br><span style="font-size:0.85rem; color:var(--text-light);">${escapeHtml(m.desc.substring(0, 110))}${m.desc.length > 110 ? '…' : ''}</span>` : ''}
        </div>`
    ).join('');
    resultsDiv.style.display = 'block';
    setExpanded(true);
  } else {
    resultsDiv.innerHTML = '<div style="padding:15px; color:var(--text-light); text-align: center;">No matching terms or topics found.</div>';
    resultsDiv.style.display = 'block';
    setExpanded(true);
  }
}

function executeSearch(pageId) {
  loadContent(pageId);
  document.getElementById('search-results').style.display = 'none';
  const box = document.getElementById('global-search');
  box.value = '';
  box.setAttribute('aria-expanded', 'false');
}

// Close search dropdown if clicked outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container')) {
    document.getElementById('search-results').style.display = 'none';
  }
});

// --- NEW: Dark Mode Toggle ---
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');

  // Save to LocalStorage
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  // The icon itself is swapped by CSS off body.dark-mode -- see .icon-sun /
  // .icon-moon. Assigning .innerText here used to delete the button's SVG.
  document.getElementById('theme-toggle')
    .setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

function updateSmartBackButton() {
  const backBtn = document.getElementById('smart-back-btn');
  const tooltip = document.getElementById('back-tooltip');

  if (!backBtn || !tooltip) return;

  if (navDepth > 1) {
    backBtn.style.display = 'flex';
    const prevPageId = historyStack[historyStack.length - 2];
    tooltip.innerText = `Back to ${pageTitles[prevPageId] || 'Previous Page'}`;
  } else {
    backBtn.style.display = 'none';
  }
}

function toggleMobileNav() {
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menu-btn");
  const isOpen = sidebar.classList.toggle("mobile-open");
  menuBtn.classList.toggle("change", isOpen);
  menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");

  let scrim = document.getElementById("sidebar-scrim");
  if (isOpen) {
    if (!scrim) {
      scrim = document.createElement("div");
      scrim.id = "sidebar-scrim";
      scrim.className = "sidebar-scrim";
      scrim.addEventListener("click", toggleMobileNav);
      document.body.appendChild(scrim);
    }
    scrim.classList.add("visible");
    document.body.style.overflow = "hidden";
  } else if (scrim) {
    scrim.classList.remove("visible");
    document.body.style.overflow = "";
  }
}

function toggleSubMenu(id) {
  // Close all other submenus first
  const allSubmenus = document.querySelectorAll('.submenu');
  allSubmenus.forEach(menu => {
    if (menu.id !== id) menu.classList.remove('show-submenu');
  });

  if (id) {
    document.getElementById(id).classList.toggle("show-submenu");
  }
}

// --- POST-RENDER ENHANCEMENT ---
//
// Applied to every page after its HTML is injected. Doing this once, centrally,
// rather than hand-editing ~1,700 inline-styled elements means new content picks
// the behaviour up for free.
//
// 1. Wide tables get a horizontal scroller so they stop widening the page on a
//    phone (p2_sys needed 456px inside a 343px column).
// 2. Clickable <div>s become real keyboard controls. Roughly 120 of them --
//    every quiz topic card, difficulty selector and dashboard tile -- were
//    mouse-only, so the whole site was unusable without a pointer.
function enhanceRenderedPage(root) {
  // 1. Wrap tables that aren't already inside a scroller.
  root.querySelectorAll('table').forEach(table => {
    if (table.closest('.table-scroll')) return;
    const wrap = document.createElement('div');
    wrap.className = 'table-scroll';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  // 2. Drag sources and drop targets need a tab stop so the keyboard
  //    alternative above can reach them.
  root.querySelectorAll('[draggable="true"], .parsons-block').forEach(el => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if (!el.hasAttribute('aria-grabbed')) el.setAttribute('aria-grabbed', 'false');
  });
  root.querySelectorAll('.drop-zone, .parsons-dropzone').forEach(el => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
  });

  // 3. Make onclick-only elements focusable and operable from the keyboard.
  // querySelectorAll excludes `root` itself, which matters when the observer
  // hands us a single newly-appended clickable element.
  if (root.hasAttribute && root.hasAttribute('onclick')) makeKeyboardOperable(root);
  root.querySelectorAll('[onclick]').forEach(makeKeyboardOperable);
}

// <a>, <button> and form controls are already keyboard-operable; everything
// else carrying a click handler needs a role, a tab stop and Enter/Space.
const NATIVELY_OPERABLE = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];

function makeKeyboardOperable(el, label) {
  if (!el || NATIVELY_OPERABLE.includes(el.tagName)) return;
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
  if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
  if (label && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', label);
}

// Several activities replace part of the page after the initial render (the
// quiz results screen, the boss victory screen, the generated quiz menu). Rather
// than remembering to call enhanceRenderedPage() at each of those sites, watch
// the display area and enhance whatever appears.
let enhancing = false; // wrapping a table mutates the tree; don't re-enter
function observeDisplayArea() {
  const area = document.getElementById('display-area');
  if (!area || typeof MutationObserver === 'undefined') return;

  new MutationObserver(records => {
    if (enhancing) return;
    // Enhance only the subtrees that actually appeared. Re-scanning the whole
    // page on every mutation is needlessly expensive on the larger topic pages.
    const roots = [];
    records.forEach(r => r.addedNodes.forEach(n => {
      if (n.nodeType === 1 && n.isConnected) roots.push(n);
    }));
    if (!roots.length) return;

    enhancing = true;
    try { roots.forEach(enhanceRenderedPage); } finally { enhancing = false; }
  }).observe(area, { childList: true, subtree: true });
}

// One delegated handler rather than a listener per element: Enter and Space
// activate anything we've marked as a button, matching native <button>.
document.addEventListener('keydown', ev => {
  if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;

  const el = ev.target;
  if (!el || el.getAttribute('role') !== 'button') return;
  if (NATIVELY_OPERABLE.includes(el.tagName)) return;
  if (el.getAttribute('aria-disabled') === 'true') return;

  ev.preventDefault(); // stop Space scrolling the page
  el.click();
});

function loadContent(topic, fromHistory = false) {
  const display = document.getElementById("display-area");

  // Unknown topic (stale bookmark, hand-edited hash, typo in a link): fall back
  // to the dashboard rather than silently leaving the previous page on screen
  // while the sidebar highlight moves on without it.
  if (!contentData[topic]) {
    if (topic !== 'home') loadContent('home', fromHistory);
    return;
  }

  // Navigating away invalidates anything the outgoing page had in flight.
  resetPageState();

  // --- AUTOMATIC NAV HIGHLIGHT (sidebar and mobile bottom bar) ---
  document.querySelectorAll('.sidebar-nav .nav-link, .bottom-nav a').forEach(nav => {
    nav.classList.remove('active');
    nav.removeAttribute('aria-current');
  });
  document.querySelectorAll(`.sidebar-nav .nav-link[data-page="${topic}"], .bottom-nav a[data-page="${topic}"]`)
    .forEach(nav => {
      nav.classList.add('active');
      nav.setAttribute('aria-current', 'page');
    });
  // -----------------------------------

  {
    display.innerHTML = contentData[topic];
    enhanceRenderedPage(display);
    document.title = pageTitles[topic] ? `${pageTitles[topic]} | CS GCSE Hub` : 'CS GCSE Hub';

    // Record the visit in the browser's own history unless we got here *from*
    // the browser (popstate), in which case the entry already exists.
    if (!fromHistory && currentRoute() !== topic) {
      navDepth++;
      history.pushState({ page: topic, depth: navDepth }, '', '#' + topic);
      historyStack.push(topic);
    }
    updateSmartBackButton(); // Update floating button

    // Initialise specific page features
    if (topic === 'home') {
      refreshDailyContent();
    }
    else if (topic === 'quiz_trainer') {
      populateQuizMenu();
    }
    else if (topic === 'p1_revision') {
      buildDeck(p1_cards);
    } else if (topic === 'p2_revision') {
      buildDeck(p2_cards);
    }
  }

  // Close sidebar after navigation on mobile
  if (window.innerWidth < 768) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
      toggleMobileNav();
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// The floating Back button now just drives the browser, so it and the device
// Back gesture always agree with each other.
function goBack() {
  if (navDepth > 1) {
    history.back();
  } else {
    loadContent('home');
  }
}

// --- ROUTING ---
// The page id currently reflected in the address bar.
function currentRoute() {
  return decodeURIComponent(location.hash.replace(/^#/, ''));
}

// In-app anchors keep a real href so they can be shared, bookmarked and opened
// in a new tab, but JavaScript owns the actual navigation: letting the browser
// also perform its own fragment navigation pushes a second, state-less history
// entry and desynchronises the route. Modified clicks are left alone so
// ctrl/cmd/middle-click still opens the page in a new tab.
document.addEventListener('click', (ev) => {
  if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
  const link = ev.target.closest && ev.target.closest('a[href^="#"]');
  if (!link) return;

  ev.preventDefault();

  // Links with an inline onclick (the sidebar) route themselves; a plain
  // "#page" link elsewhere in the content is routed here.
  const route = link.getAttribute('href').slice(1);
  if (!link.getAttribute('onclick') && route && contentData[route]) {
    loadContent(route);
  }
});

// Browser Back/Forward (including the Android gesture and iOS edge-swipe).
window.addEventListener('popstate', (ev) => {
  const target = (ev.state && ev.state.page) || currentRoute() || 'home';
  const newDepth = (ev.state && typeof ev.state.depth === 'number') ? ev.state.depth : 0;

  // Keep the tooltip stack in step with whichever direction we moved.
  if (newDepth < navDepth) historyStack.pop();
  else if (newDepth > navDepth) historyStack.push(target);
  navDepth = newDepth;

  loadContent(target, true);
});

// Resolve the opening page from the URL so a bookmarked or shared link such as
// /#binary_boss lands directly on that activity.
function startRouting() {
  const initial = currentRoute() || 'home';
  const topic = contentData[initial] ? initial : 'home';
  navDepth = 1;
  historyStack = [topic];
  history.replaceState({ page: topic, depth: 1 }, '', '#' + topic);
  loadContent(topic, true);
}

// Drag and Drop Logic
//
// The drop *rules* live in performMatchDrop / performParsonsDrop so that the
// native HTML5 handlers below and the pointer-based touch shim further down
// share one implementation. See the TOUCH DRAG SHIM section for why the second
// path exists at all.
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

// Returns true if the tile landed somewhere meaningful.
function performMatchDrop(draggedElement, dropTarget) {
  if (!draggedElement || !dropTarget) return false;
  const dropZone = dropTarget.closest('.drop-zone');
  const feedback = document.getElementById('game-feedback');
  if (!dropZone || !feedback) return false;

  const correctPhase = draggedElement.getAttribute('data-phase');
  const targetPhase = dropZone.id;

  if (correctPhase === targetPhase) {
    dropZone.appendChild(draggedElement);
    draggedElement.style.background = "var(--accent-green-strong)"; // Success Green
    draggedElement.style.cursor = "default";
    draggedElement.setAttribute("draggable", "false");
    feedback.innerText = "Correct! " + draggedElement.innerText + " placed.";
    feedback.style.color = "green";
  } else {
    feedback.innerText = "Incorrect placement for " + draggedElement.innerText + ". Try again.";
    feedback.style.color = "#dc3545";
  }
  return true;
}

function drop(ev) {
  ev.preventDefault();
  const draggedElement = document.getElementById(ev.dataTransfer.getData("text"));
  performMatchDrop(draggedElement, ev.target);
}

// --- CONNECTING WALL DATA ---
const wallBank = {
  '3.1': [
    { cat: "Flowchart Symbols", items: ["Diamond", "Parallelogram", "Rectangle", "Oval"] },
    { cat: "Searching Algorithms", items: ["Linear", "Binary", "Search Area", "Middle Item"] },
    { cat: "Sorting Algorithms", items: ["Bubble", "Merge", "Insertion", "Divide and Conquer"] },
    { cat: "Computational Thinking", items: ["Abstraction", "Decomposition", "Algorithmic Thinking", "Pattern Recognition"] },
    { cat: "Algorithm Efficiency", items: ["Time", "Space", "Comparisons", "Passes"] },
    { cat: "Trace Table Columns", items: ["Variables", "Output", "Conditions", "Iterations"] },
    { cat: "Boolean Logic", items: ["AND", "OR", "NOT", "XOR"] },
    { cat: "Algorithm Inputs", items: ["Data", "Parameters", "Values", "Sensors"] }
  ],
  '3.2': [
    { cat: "Basic Data Types", items: ["Integer", "Real", "Boolean", "String"] },
    { cat: "Arithmetic Operators", items: ["MOD", "DIV", "Exponentiation", "Quotient"] },
    { cat: "Programming Constructs", items: ["Sequence", "Selection", "Iteration", "Condition"] },
    { cat: "Subroutine Components", items: ["Parameters", "Arguments", "Return Value", "Local Variables"] },
    { cat: "String Manipulation", items: ["Length", "Substring", "Upper", "Lower"] },
    { cat: "Error Types", items: ["Syntax", "Runtime", "Logic", "Compilation"] },
    { cat: "Variable Scope", items: ["Global", "Local", "Static", "Block"] },
    { cat: "File Handling", items: ["Open", "Read", "Write", "Close"] }
  ],
  '3.3': [
    { cat: "Units of Information", items: ["Petabyte", "Terabyte", "Nibble", "Byte"] },
    { cat: "Character Encoding", items: ["ASCII", "Unicode", "Character Set", "7-bit"] },
    { cat: "Image Representation", items: ["Resolution", "Colour Depth", "Metadata", "Pixel"] },
    { cat: "Sound Representation", items: ["Sample Rate", "Bit Depth", "Hertz", "Amplitude"] },
    { cat: "Compression Types", items: ["Lossy", "Lossless", "Run-length", "Huffman"] },
    { cat: "Binary Arithmetic", items: ["Addition", "Shift Left", "Shift Right", "Overflow"] },
    { cat: "Number Bases", items: ["Binary", "Denary", "Hexadecimal", "Base-10"] },
    { cat: "Hexadecimal Uses", items: ["MAC Addresses", "Color Codes", "Memory Dumps", "IPv6"] }
  ],
  '3.4': [
    { cat: "Hardware Components", items: ["Motherboard", "CPU", "NIC", "Hard Drive"] },
    { cat: "CPU Components", items: ["Control Unit", "ALU", "Cache", "Clock"] },
    { cat: "Primary Memory", items: ["RAM", "ROM", "Virtual Memory", "Registers"] },
    { cat: "Secondary Storage", items: ["Magnetic", "Solid State", "Cloud", "USB Flash Drive"] },
    { cat: "FDE Cycle", items: ["Fetch", "Decode", "Execute", "Instruction"] },
    { cat: "CPU Performance", items: ["Clock Speed", "Cores", "Cache Size", "Bus Width"] },
    { cat: "Software Types", items: ["Operating System", "Utility", "Application", "Firmware"] },
    { cat: "OS Functions", items: ["Memory Management", "File Management", "User Interface", "Peripheral Management"] }
  ],
  '3.5': [
    { cat: "Network Hardware", items: ["Router", "Switch", "NIC", "Hub"] },
    { cat: "Email Protocols", items: ["SMTP", "IMAP", "POP3", "Mail Server"] },
    { cat: "Application Layer Protocols", items: ["HTTP", "HTTPS", "SMTP", "IMAP"] },
    { cat: "Network Types", items: ["LAN", "WAN", "PAN", "VPN"] },
    { cat: "Wireless Networking", items: ["Wi-Fi", "Bluetooth", "WAP", "Frequencies"] },
    { cat: "Network Layers", items: ["Application", "Transport", "Internet", "Link"] },
    { cat: "Hosting & Web", items: ["Client-Server", "Peer-to-Peer", "DNS", "Web Server"] }
  ],
  '3.6': [
    { cat: "Social Engineering", items: ["Phishing", "Blagging", "Shoulder Surfing", "Pretexting"] },
    { cat: "Malware Types", items: ["Trojan Horse", "Ransomware", "Spyware", "Worm"] },
    { cat: "Technical Prevention", items: ["Firewall", "Encryption", "Authentication", "MAC Filtering"] },
    { cat: "Security Testing", items: ["Black-box", "White-box", "Vulnerability", "Penetration"] },
    { cat: "Network Threats", items: ["SQL Injection", "DDoS", "Packet Sniffing", "Man-in-the-Middle"] },
    { cat: "Biometric Authentication", items: ["Fingerprint", "Retina", "Voice", "Facial"] },
    { cat: "Cyber Attack Motives", items: ["Financial", "Political", "Disruption", "Espionage"] },
    { cat: "Vulnerabilities", items: ["Unpatched Software", "Weak Passwords", "Misconfiguration", "USB Drops"] }
  ],
  '3.7': [
    { cat: "Database Components", items: ["Table", "Record", "Field", "Data Type"] },
    { cat: "Relationship Keys", items: ["Primary Key", "Foreign Key", "Unique ID", "Link Field"] },
    { cat: "SQL Data Manipulation", items: ["INSERT INTO", "UPDATE", "DELETE FROM", "CREATE TABLE"] },
    { cat: "SQL Retrieval Commands", items: ["SELECT", "FROM", "WHERE", "ORDER BY"] },
    { cat: "Data Validation", items: ["Length Check", "Presence Check", "Format Check", "Range Check"] },
    { cat: "SQL Data Types", items: ["VARCHAR", "INTEGER", "BOOLEAN", "DATE"] },
    { cat: "Database Security", items: ["Access Rights", "Passwords", "Encryption", "Views"] },
    { cat: "Database Concepts", items: ["Relational", "Flat-file", "Query", "Form"] }
  ],
  '3.8': [
    { cat: "Legal Acts (UK Law)", items: ["Computer Misuse", "Data Protection", "Copyright Designs", "Freedom of Info"] },
    { cat: "Environmental Impacts", items: ["E-waste", "Energy Consumption", "Toxic Chemicals", "Cooling Systems"] },
    { cat: "Software Models", items: ["Open Source", "Proprietary", "Free Software", "Closed Source"] },
    { cat: "Ethical & Privacy Issues", items: ["Digital Divide", "Surveillance", "Data Privacy", "Cyberbullying"] },
    { cat: "Open Source Features", items: ["Free", "Modifiable", "Community Support", "Inspectable"] },
    { cat: "Proprietary Features", items: ["Paid", "Copyrighted", "Compiled", "Vendor Lock-in"] },
    { cat: "AI Concerns", items: ["Bias", "Job Replacement", "Accountability", "Deepfakes"] },
    { cat: "Tech Stakeholders", items: ["Customers", "Employees", "Suppliers", "Local Community"] }
  ],
  'PAPER_1': [
    { cat: "Flowchart Symbols", items: ["Diamond", "Parallelogram", "Rectangle", "Oval"] },
    { cat: "Programming Constructs", items: ["Sequence", "Selection", "Iteration", "Subroutine"] },
    { cat: "Search/Sort Algs", items: ["Bubble", "Merge", "Binary", "Linear"] },
    { cat: "Computational Thinking", items: ["Abstraction", "Decomposition", "Algorithmic Thinking", "Pattern Recognition"] },
    { cat: "Data Representation", items: ["Base-2", "Hexadecimal", "ASCII", "Pixels"] },
    { cat: "Truth Tables", items: ["1", "0", "True", "False"] },
    { cat: "Data Types", items: ["Integer", "Real", "Boolean", "String"] },
    { cat: "Programming Errors", items: ["Syntax", "Logic", "Runtime", "Compilation"] }
  ],
  'PAPER_2': [
    { cat: "Network Layers (TCP/IP)", items: ["Application", "Transport", "Internet", "Link"] },
    { cat: "Storage Media", items: ["Magnetic", "Solid State", "Cloud", "USB Flash Drive"] },
    { cat: "Cyber Security Threats", items: ["Phishing", "Social Engineering", "Brute Force", "DDoS"] },
    { cat: "Data Validation", items: ["Range Check", "Presence Check", "Format Check", "Length Check"] },
    { cat: "OS Utilities", items: ["Defragmentation", "Backup", "Compression", "Formatting"] },
    { cat: "CPU Registers", items: ["MAR", "MDR", "PC", "ACC"] },
    { cat: "Legislation", items: ["Computer Misuse Act", "GDPR", "Copyright", "FOI"] },
    { cat: "Environmental", items: ["E-Waste", "Carbon Footprint", "Energy Use", "Toxic Materials"] }
  ]
};

// --- CONNECTING WALL STATE & LOGIC ---
let currentWallItems = [];
let selectedTiles = [];
let solvedGroups = 0;
let currentWallData = [];
let guessingPhase = false;
let currentGuessIndex = 0;
// Latched when a wall has paid out, so the completion branch can never award a
// second 50 XP / 'walls' achievement (double-click, stray re-entry, etc).
let wallCompleted = false;

function shuffleWallArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showWallMenu() {
  document.getElementById('wall-area').style.display = 'none';
  document.getElementById('wall-selection-menu').style.display = 'block';
}

function startConnectingWall(type) {
  // Hide menu, show game area
  document.getElementById('wall-selection-menu').style.display = 'none';
  document.getElementById('wall-area').style.display = 'block';

  // Reset State
  solvedGroups = 0;
  guessingPhase = false;
  selectedTiles = [];
  currentGuessIndex = 0;
  wallCompleted = false;

  document.getElementById('wall-topic-display').innerText = "CONNECTING WALL: " + type;
  document.getElementById('wall-solved-categories').innerHTML = '';
  document.getElementById('wall-feedback').innerText = '';

  // Fetch and shuffle data. Groups covering content AQA removed for 2027 are
  // dropped, since walls award XP and an achievement.
  let fullWallData = wallBank[type] || wallBank['PAPER_1'];
  let shuffledCategories = shuffleWallArray(fullWallData.filter(g => !g.removed2027));
  currentWallData = shuffledCategories.slice(0, 4);

  currentWallItems = [];
  currentWallData.forEach((group, index) => {
    group.items.forEach(item => {
      currentWallItems.push({ text: item, groupId: index, solved: false });
    });
  });

  currentWallItems = shuffleWallArray(currentWallItems);
  renderWall();
}

function renderWall() {
  const grid = document.getElementById('wall-grid');
  grid.innerHTML = '';
  currentWallItems.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'wall-tile';
    if (item.solved) div.classList.add('solved', `solved-group-${item.solvedGroupId}`);
    div.innerText = item.text;
    div.onclick = () => handleTileClick(div, item);
    // Assigned as a property, not an onclick attribute, so the generic
    // enhancement pass can't see it -- mark it up here instead.
    makeKeyboardOperable(div);
    div.setAttribute('aria-pressed', 'false');
    if (item.solved) div.setAttribute('aria-disabled', 'true');
    grid.appendChild(div);
  });
}

function handleTileClick(div, item) {
  if (item.solved || guessingPhase) return;

  if (div.classList.contains('selected')) {
    div.classList.remove('selected');
    div.setAttribute('aria-pressed', 'false');
    selectedTiles = selectedTiles.filter(t => t.item !== item);
  } else if (selectedTiles.length < 4) {
    div.classList.add('selected');
    div.setAttribute('aria-pressed', 'true');
    selectedTiles.push({ div, item });
  }

  if (selectedTiles.length === 4) checkWallGroup();
}

function checkWallGroup() {
  const groupIds = selectedTiles.map(t => t.item.groupId);
  const firstGroup = groupIds[0];

  if (groupIds.every(id => id === firstGroup)) {
    selectedTiles.forEach(t => {
      t.item.solved = true;
      t.item.solvedGroupId = solvedGroups;
    });

    const solved = currentWallItems.filter(i => i.solved).sort((a, b) => a.solvedGroupId - b.solvedGroupId);
    const unsolved = currentWallItems.filter(i => !i.solved);
    currentWallItems = [...solved, ...unsolved];

    solvedGroups++;
    selectedTiles = [];
    renderWall();

    // Auto-solve 4th group. The delays below outlive a click away from the
    // page, so each one checks the page is still this wall before touching it.
    const epoch = pageEpoch;
    const stillHere = () => epoch === pageEpoch;
    if (solvedGroups === 3) {
      setTimeout(() => {
        if (!stillHere()) return;
        const remaining = currentWallItems.filter(i => !i.solved);
        remaining.forEach(item => {
          item.solved = true;
          item.solvedGroupId = 3;
        });
        solvedGroups++;
        renderWall();
        setTimeout(() => { if (stillHere()) startGuessingPhase(); }, 1000);
      }, 800);
    } else if (solvedGroups === 4) {
      setTimeout(() => { if (stillHere()) startGuessingPhase(); }, 1000);
    }
  } else {
    document.getElementById('wall-feedback').innerText = "Wrong! Try again.";
    const epoch = pageEpoch;
    setTimeout(() => {
      if (epoch !== pageEpoch) return;
      selectedTiles.forEach(t => t.div.classList.remove('selected'));
      selectedTiles = [];
      document.getElementById('wall-feedback').innerText = "";
    }, 800);
  }
}

function startGuessingPhase() {
  guessingPhase = true;
  currentGuessIndex = 0;
  document.getElementById('wall-feedback').innerText = "All groups found! Now, identify connections.";
  showNextConnectionGuess();
}

function showNextConnectionGuess() {
  if (wallCompleted) return; // this wall has already paid out

  const tiles = document.querySelectorAll('.wall-tile');
  tiles.forEach(t => t.style.opacity = "0.2");

  if (currentGuessIndex < 4) {
    for (let i = currentGuessIndex * 4; i < (currentGuessIndex * 4) + 4; i++) {
      tiles[i].style.opacity = "1";
      tiles[i].style.border = "3px solid white";
    }

    const guessArea = document.getElementById('wall-solved-categories');
    let container = guessArea.querySelector('.guess-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'guess-container fade-in';
      guessArea.appendChild(container);
    }

    container.innerHTML = `
            <p style="color: var(--text); margin-bottom: 15px;">What's the connection between these highlighted items?</p>
            <button class="mock-btn p1-btn" style="padding: 10px 20px;" onclick="revealConnection(${currentGuessIndex})">REVEAL CONNECTION</button>
        `;
  } else {
    wallCompleted = true;

    // Remove the FINISH button *before* paying out. It used to be left in the
    // DOM, so every extra click re-entered this branch and handed out another
    // 50 XP and another 'walls' achievement.
    const container = document.getElementById('wall-solved-categories').querySelector('.guess-container');
    if (container) container.remove();

    // Bring the tiles back to full opacity -- the dimming at the top of this
    // function is only meant to spotlight the row being guessed.
    document.querySelectorAll('.wall-tile').forEach(t => {
      t.style.opacity = "1";
      t.style.border = "";
    });

    // Award 50 XP upon completion and show it to the user
    document.getElementById('wall-feedback').innerHTML = "WALL COMPLETE! <br><span style='color: var(--accent-green-text); font-size: 1rem;'>+50 XP</span>";
    updateXP(50);
    incrementAchievement('walls');
  }
}
function revealConnection(rowIndex) {
  const actualGroupId = currentWallItems[rowIndex * 4].groupId;
  const catName = currentWallData[actualGroupId].cat;

  const answerDiv = document.createElement('div');
  answerDiv.className = 'solved-category-info fade-in';
  answerDiv.style.backgroundColor = getComputedStyle(document.querySelectorAll('.wall-tile')[rowIndex * 4]).backgroundColor;
  answerDiv.innerHTML = `<b>CONNECTION:</b> ${catName}`;

  const container = document.getElementById('wall-solved-categories').querySelector('.guess-container');
  document.getElementById('wall-solved-categories').insertBefore(answerDiv, container);

  currentGuessIndex++;
  container.innerHTML = `
        <button class="option-btn" style="max-width: 250px; margin: 0 auto; display: block;" onclick="showNextConnectionGuess()">
            ${currentGuessIndex < 4 ? "NEXT CONNECTION" : "FINISH"}
        </button>
    `;
}

// --- NEW LOGIC: REVISION FLASHCARDS ---

const p1_cards = [
  // 1-10
  { term: "Algorithm", def: "A set of step-by-step instructions to solve a problem." },
  { term: "Decomposition", def: "Breaking down a complex problem into smaller, manageable parts." },
  { term: "Abstraction", def: "Removing unnecessary details to focus on the essential features." },
  { term: "Variable", def: "A named memory location used to store data that can change while the program runs." },
  { term: "Constant", def: "A value that cannot be changed during the execution of the program." },
  { term: "Sequence", def: "Executing instructions one after another in order." },
  { term: "Selection", def: "A programming construct (IF/ELSE) where a section of code is run only if a condition is met." },
  { term: "Iteration", def: "Repeating a block of code (Loops: FOR, WHILE)." },
  { term: "Array (List)", def: "A data structure that stores multiple items of the same data type under a single variable name." },
  { term: "Subroutine", def: "A named block of code that performs a specific task and can be called from other parts of the program." },

  // 11-20
  { term: "Pseudocode", def: "A method of writing algorithms using plain English that resembles programming code." },
  { term: "Flowchart", def: "A visual diagram representing an algorithm using standard shapes (diamonds for decisions, rectangles for process)." },
  { term: "Syntax Error", def: "An error that occurs when a rule of the programming language is broken (e.g., missing brackets)." },
  { term: "Logic Error", def: "An error where the program runs but produces the wrong output or unexpected behavior." },
  { term: "Trace Table", def: "A method used to manually track the values of variables line-by-line to test an algorithm." },
  { term: "Binary Search", def: "An efficient search algorithm that finds a target by repeatedly dividing a SORTED list in half." },
  { term: "Linear Search", def: "A simple search algorithm that checks every item in a list sequentially from the start." },
  { term: "Bubble Sort", def: "A sorting algorithm that repeatedly swaps adjacent elements if they are in the wrong order." },
  { term: "Merge Sort", def: "A 'divide and conquer' algorithm that splits a list into individual elements and merges them back together." },
  { term: "Casting", def: "The process of converting data from one type to another (e.g., converting '5' to 5)." }
];

const p2_cards = [
  // 3.3 Data Representation
  { term: "Bit", def: "The smallest unit of data in a computer, representing a 0 or a 1." },
  { term: "Nibble", def: "A group of 4 bits." },
  { term: "Byte", def: "A group of 8 bits." },
  { term: "Hexadecimal", def: "A base-16 number system used by humans to represent long binary strings more easily." },
  { term: "ASCII", def: "A 7-bit or 8-bit character set used to represent English characters and symbols." },
  { term: "Unicode", def: "A universal character set (16 or 32-bit) that can represent every language and emoji globally." },
  { term: "Pixel", def: "The smallest identifiable area of a bitmap image." },
  { term: "Resolution", def: "The concentration of pixels within a specific area (e.g., Dots Per Inch)." },
  { term: "Sampling", def: "The process of recording the amplitude of an analogue sound wave at set intervals to convert it to digital." },
  { term: "Lossy Compression", def: "Reducing file size by permanently removing some data (e.g., MP3, JPEG)." },
  { term: "Lossless Compression", def: "Reducing file size without losing any data, allowing the original to be perfectly reconstructed (e.g., RLE, ZIP)." },

  // 3.4 Computer Systems
  { term: "CPU", def: "The 'brain' of the computer that fetches, decodes, and executes instructions." },
  { term: "Control Unit (CU)", def: "Component of the CPU that directs data flow and decodes instructions." },
  { term: "ALU", def: "The Arithmetic Logic Unit; performs all mathematical and logical operations in the CPU." },
  { term: "Register", def: "Extremely fast, temporary storage locations within the CPU (e.g., Accumulator, Program Counter)." },
  { term: "Cache", def: "High-speed memory in the CPU that stores frequently used data for faster access than RAM." },
  { term: "RAM", def: "Random Access Memory; volatile primary storage for data and programs currently in use." },
  { term: "ROM", def: "Read Only Memory; non-volatile memory containing the start-up instructions (bootstrap) for the computer." },

  // --- 3.5 Computer Networks ---
  { term: "Node", def: "Any device connected to a network, such as a computer, printer, or server." },
  { removed2027: true, term: "Topology", def: "The physical or logical layout of a network. AQA 8525 covered star and bus only, and both were withdrawn for exams from 2027." },
  { removed2027: true, term: "Star Topology", def: "A network where all nodes connect to a central switch or hub; easy to add devices but relies on the central node." },
  { term: "Protocol", def: "A set of rules that allow devices to communicate by defining how data is formatted and sent." },
  { term: "Packet Switching", def: "The process of breaking data into small 'packets' to be sent across a network and reassembled at the destination." },
  { term: "TCP/IP Layer Stack", def: "A four-layer model (Application, Transport, Internet, Link) that ensures different hardware can communicate." },
  { term: "HTTP/HTTPS", def: "Protocols for web browsers to access websites; HTTPS uses encryption for security." },
  { removed2027: true, term: "FTP", def: "File Transfer Protocol; used specifically for moving files between computers over a network." },
  { term: "SMTP/IMAP", def: "Protocols used for email; SMTP sends mail, while IMAP retrieves and manages mail on a server." },

  // --- 3.6 Cyber Security ---
  { term: "Cyber Security", def: "The processes and technologies designed to protect networks and data from unauthorised access or damage." },
  { term: "Social Engineering", def: "Manipulating people into giving up confidential information (e.g. Phishing, Blagging, or Shouldering)." },
  { term: "Malware", def: "Malicious software designed to harm a system, including Viruses, Worms, Trojans, and Spyware." },
  { term: "Trojan", def: "Malware disguised as legitimate software that creates a 'backdoor' for attackers." },
  { term: "Phishing", def: "Using fake emails and websites to trick users into entering credentials or sensitive data." },
  { term: "Brute Force", def: "An automated trial-and-error attack that tries every possible password combination until successful." },
  { term: "DoS (Denial of Service)", def: "Flooding a server with useless traffic to crash it and prevent legitimate users from accessing it." },
  { term: "SQL Injection", def: "Entering malicious code into a web form to manipulate or steal data from a backend database." },
  { term: "Penetration Testing", def: "Authorised simulated attacks used to identify and fix security weaknesses in a system." },
  { term: "Encryption", def: "Scrambling data using an algorithm so it can only be read with the correct decryption key." },

  // --- 3.7 Relational Databases (SQL) ---
  { term: "Database", def: "A persistent, organised store of related data." },
  { term: "Relational Database", def: "A database that uses multiple tables linked together using keys to reduce data redundancy." },
  { term: "Data Redundancy", def: "Storing the same piece of data in multiple places, leading to inefficiency and potential errors." },
  { term: "Primary Key", def: "A field that uniquely identifies every record in a table (e.g. Student_ID)." },
  { term: "Foreign Key", def: "A primary key from one table that appears in another to link the two together." },
  { term: "DBMS", def: "Database Management System; software used to create, edit, and search databases." },
  { term: "SQL", def: "Structured Query Language; the standard language for querying and manipulating databases." },
  { term: "Wildcard (*)", def: "An SQL symbol used to select 'all' fields in a query." },

  // --- 3.8 Impacts of Digital Technology ---
  { term: "Stakeholder", def: "A person or group who is affected by an issue (e.g. employees, customers, or the government)." },
  { term: "Ethical Issue", def: "An issue focusing on what is considered morally right or wrong in society." },
  { term: "Legal Issue", def: "An issue focusing on what is right or wrong in the eyes of the law." },
  { term: "Cultural Issue", def: "How technology affects different groups, such as the digital divide or changes in social behaviour." },
  { term: "Digital Divide", def: "The gap between those who have access to modern technology and fast internet and those who do not." },
  { term: "E-Waste", def: "Electronic waste; discarded devices that often contain harmful chemicals and leak into the environment." },
  { term: "Proprietary Software", def: "Software where the source code is hidden and owned by a company; users must pay for a licence." },
  { term: "Open Source Software", def: "Software where the source code is freely available to view, edit, and share." }
];

// Variables
let currentCardIndex = 0;
let isFlipped = false;
let shuffledCards = []; // This will hold the randomized order

// ============================================================================
// DESIGN MOVE 03 -- SPACED FLASHCARDS
// ============================================================================
// The decks were shuffled and dealt in a straight line, so a term known cold
// since September came round exactly as often as one never once recalled.
//
// A five-box Leitner system: a card recalled moves up a box and is shown less
// often; a card missed drops straight back to box 1. Each card stores its box
// and the day it is next due, using the existing signed-integer storage.
//
// Index is the box number. Box 1 is 0 days, so a card marked "Again" is due
// straight away and returns if the student opens the deck again today; box 5 is
// only seen every 16 days.
const LEITNER_INTERVALS = [0, 0, 1, 3, 7, 16];
const LEITNER_BOXES = 5;

function cardKey(card) {
  // Terms are unique within a deck and stable, so they make a usable id.
  return 'fc-' + card.term.replace(/[^A-Za-z0-9]/g, '').slice(0, 24);
}

function getCardBox(card) {
  return Math.min(LEITNER_BOXES, Math.max(1, secureGetInt(cardKey(card) + '-b', 1)));
}

function getCardDue(card) {
  return secureGetInt(cardKey(card) + '-d', 0);   // 0 means never rated, so due now
}

function isCardDue(card) {
  return getCardDue(card) <= dayIndex(todayUTC());
}

// grade: 'again' | 'hard' | 'got'
function rateCard(card, grade) {
  const key = cardKey(card);
  let box = getCardBox(card);

  if (grade === 'again') box = 1;
  else if (grade === 'hard') box = Math.max(1, box - 1);
  else box = Math.min(LEITNER_BOXES, box + 1);

  secureSetInt(key + '-b', box);
  secureSetInt(key + '-d', dayIndex(todayUTC()) + LEITNER_INTERVALS[box]);
}

// How the whole deck is distributed across the boxes, for the summary strip.
function deckBoxCounts(deck) {
  const counts = [0, 0, 0, 0, 0];
  deck.forEach(c => { counts[getCardBox(c) - 1]++; });
  return counts;
}

// Fisher-Yates Shuffle Algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// MOVE 03: the session is the cards actually due today, so it has an end.
let fullDeck = [];

function buildDeck(source) {
  fullDeck = source;
  const due = source.filter(isCardDue);
  // Nothing due means everything is well learned; offer the whole deck rather
  // than an empty screen, but say so.
  shuffledCards = (due.length ? [...due] : [...source]);
  shuffleArray(shuffledCards);
  currentCardIndex = 0;
  updateCard();
  renderDeckSummary(due.length === 0);
}

function renderDeckSummary(allCaughtUp) {
  const host = document.getElementById('deck-summary');
  if (!host || !fullDeck.length) return;
  const counts = deckBoxCounts(fullDeck);
  const unseen = fullDeck.filter(c => getCardDue(c) === 0).length;
  const labels = ['Learning', 'Soon', 'Later', 'Rarely', 'Known'];
  host.innerHTML = `
    <div class="deck-boxes">
      ${counts.map((c, i) => `
        <div class="deck-box">
          <div class="deck-box-n">${c}</div>
          <div class="deck-box-l">${labels[i]}</div>
        </div>`).join('')}
    </div>
    <div class="deck-note">${allCaughtUp
      ? 'Nothing due today &mdash; showing the whole deck for a free run.'
      : `Today's deck: <b>${shuffledCards.length}</b> of ${fullDeck.length} cards${
          unseen ? ` &middot; ${unseen} not rated yet` : ''}`}</div>`;
}

// Rate the card on screen, then move on.
function rateCurrentCard(grade) {
  if (!shuffledCards.length) return;
  rateCard(shuffledCards[currentCardIndex], grade);
  renderDeckSummary(false);

  // Drop it from this session; when the last one goes, the deck is done.
  shuffledCards.splice(currentCardIndex, 1);
  if (!shuffledCards.length) { showDeckComplete(); return; }
  if (currentCardIndex >= shuffledCards.length) currentCardIndex = 0;
  updateCard();
}

function showDeckComplete() {
  const term = document.getElementById('card-term');
  const def = document.getElementById('card-def');
  const counter = document.getElementById('card-counter');
  if (term) term.innerText = 'Deck complete';
  if (def) def.innerText = 'Every card due today has been reviewed. Come back tomorrow for the next set.';
  if (counter) counter.innerText = '0 / 0';
  renderDeckSummary(true);
}

function updateCard() {
  const card = document.getElementById('flashcard');
  const term = document.getElementById('card-term');
  const def = document.getElementById('card-def');
  const counter = document.getElementById('card-counter');

  // Reset Flip
  isFlipped = false;
  card.style.transform = "rotateY(0deg)";

  // Update Text
  setTimeout(() => {
    // Safety check
    if (!shuffledCards || shuffledCards.length === 0) return;

    // USE SHUFFLED ARRAY HERE
    const card = shuffledCards[currentCardIndex];
    if (!card) return;
    term.innerText = card.term;
    def.innerText = card.def;
    counter.innerText = (currentCardIndex + 1) + " / " + shuffledCards.length;

    // Cards covering content AQA removed for 2027 stay in the deck as useful
    // background, but say so on the card itself.
    const flag = document.getElementById('card-removed-flag');
    if (flag) flag.style.display = card.removed2027 ? 'inline-block' : 'none';
  }, 200);
}

function flipCard() {
  const card = document.getElementById('flashcard');
  if (isFlipped) {
    card.style.transform = "rotateY(0deg)";
  } else {
    card.style.transform = "rotateY(180deg)";
  }
  isFlipped = !isFlipped;
}

function nextCard() {
  // Use shuffledCards length
  if (currentCardIndex < shuffledCards.length - 1) {
    currentCardIndex++;
  } else {
    currentCardIndex = 0; // Loop back to start
  }
  updateCard();
}

function prevCard() {
  // Wraps to the end, mirroring nextCard -- it used to silently do nothing on
  // the first card.
  currentCardIndex = (currentCardIndex > 0) ? currentCardIndex - 1 : shuffledCards.length - 1;
  updateCard();
}

async function startLinearSearch() {
  const container = document.getElementById('linear-viz-container');
  const status = document.getElementById('linear-viz-info');
  const targetText = document.getElementById('linear-target-val');
  const startBtn = document.getElementById('linear-start-btn');
  const epoch = pageEpoch;

  const values = [42, 12, 89, 55, 31, 7, 94, 22, 63, 10];
  const targetIndex = Math.floor(Math.random() * values.length);
  const target = values[targetIndex];

  targetText.innerText = target;
  startBtn.disabled = true;

  const boxWidth = 50;
  const gap = 30;

  container.innerHTML = '';
  let boxes = values.map((val, i) => {
    const box = document.createElement('div');
    box.innerText = val;
    box.style.cssText = `
      width: ${boxWidth}px; height: ${boxWidth}px;
      background: #888; color: white; line-height: ${boxWidth}px;
      font-weight: bold; position: absolute; border-radius: 4px;
      left: ${i * (boxWidth + gap)}px; top: 10px;
      transition: all 0.4s ease;
    `;
    container.appendChild(box);
    return box;
  });

  for (let i = 0; i < boxes.length; i++) {
    status.innerText = `Checking index ${i}: Is ${values[i]} === ${target}?`;

    // Highlight current box (Orange/Yellow)
    boxes[i].style.background = '#ffc107';
    boxes[i].style.transform = 'scale(1.1)';

    await new Promise(r => setTimeout(r, 1000)); // Slower speed as requested
    if (epoch !== pageEpoch) return; // navigated away mid-run

    if (values[i] === target) {
      boxes[i].style.background = 'var(--accent-green)';
      boxes[i].style.transform = 'scale(1.2)';
      status.innerText = `Match Found! ${target} is at index ${i}.`;
      startBtn.disabled = false;
      return;
    }

    // Fade out non-matches
    boxes[i].style.background = '#444';
    boxes[i].style.opacity = '0.5';
    boxes[i].style.transform = 'scale(1)';
  }

  status.innerText = "Value not found in list.";
  startBtn.disabled = false;
}

let isSorting = false;

async function startBubbleSort() {
  if (isSorting) return;
  isSorting = true;
  const epoch = pageEpoch;
  const startBtn = document.getElementById('start-btn');
  startBtn.disabled = true;

  const container = document.getElementById('viz-container');
  const status = document.getElementById('viz-status');
  // Sample data
  let values = [60, 20, 90, 40, 70, 30, 80, 10, 50];

  // 1. Setup Container and initial Bars
  container.innerHTML = '';
  container.style.position = 'relative'; // Required for absolute positioning of bars

  const barWidth = 30;
  const gap = 5;

  let bars = values.map((val, i) => {
    const bar = document.createElement('div');
    bar.style.height = val + '%';
    bar.style.width = barWidth + 'px';
    bar.style.background = '#888';
    bar.style.position = 'absolute';
    bar.style.left = (i * (barWidth + gap)) + 'px';
    bar.style.transition = 'all 0.6s ease'; // Slower transition for the swap
    bar.id = 'bar-' + i;
    container.appendChild(bar);
    return bar;
  });

  // 2. Bubble Sort Logic with Position Swapping
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values.length - i - 1; j++) {
      // Highlight comparing bars in Red
      bars[j].style.background = '#dc3545';
      bars[j + 1].style.background = '#dc3545';

      status.innerText = `Comparing ${values[j]} and ${values[j + 1]}`;

      // Wait for user to see the comparison (800ms)
      await new Promise(resolve => setTimeout(resolve, 800));
      if (epoch !== pageEpoch) return; // navigated away mid-sort

      if (values[j] > values[j + 1]) {
        status.innerText = `Swapping positions...`;

        // Swap values in the array
        [values[j], values[j + 1]] = [values[j + 1], values[j]];

        // Swap visual positions (left property)
        const posJ = bars[j].style.left;
        const posJ1 = bars[j + 1].style.left;

        bars[j].style.left = posJ1;
        bars[j + 1].style.left = posJ;

        // Swap references in our bars array so the next iteration picks the right DOM elements
        [bars[j], bars[j + 1]] = [bars[j + 1], bars[j]];

        // Wait for the sliding animation to finish
        await new Promise(resolve => setTimeout(resolve, 600));
        if (epoch !== pageEpoch) return;
      }

      // Reset color back to neutral
      bars[j].style.background = '#888';
      bars[j + 1].style.background = '#888';
    }
    // Mark the last element of the pass as sorted (Green)
    bars[values.length - i - 1].style.background = 'var(--accent-green)';
  }

  status.innerText = "Sort Complete!";
  isSorting = false;
  startBtn.disabled = false;
}

async function startBinarySearch() {
  const container = document.getElementById('binary-viz-container');
  const status = document.getElementById('viz-step-info');
  const targetText = document.getElementById('target-val');
  const startBtn = document.getElementById('binary-start-btn');
  const epoch = pageEpoch;

  // Generate sorted values
  const values = [10, 18, 25, 32, 40, 48, 55, 62, 70, 78, 85, 92, 99];
  const target = values[Math.floor(Math.random() * values.length)];
  targetText.innerText = target;
  startBtn.disabled = true;

  container.innerHTML = '';
  let bars = values.map((val, i) => {
    const bar = document.createElement('div');
    bar.style.height = val + '%';
    bar.style.width = '22px';
    bar.style.background = '#888';
    bar.style.transition = 'all 0.6s ease';
    container.appendChild(bar);
    return bar;
  });

  let low = 0;
  let high = values.length - 1;

  while (low <= high) {
    let mid = Math.floor((low + high) / 2);

    // Dim bars outside the current search range
    for (let i = 0; i < bars.length; i++) {
      if (i < low || i > high) {
        bars[i].style.opacity = '0.2';
        bars[i].style.background = '#333';
      }
    }

    // Highlight current middle in Red
    bars[mid].style.background = '#dc3545';
    bars[mid].style.transform = 'scale(1.1)';
    status.innerText = `Checking middle index ${mid} (Value: ${values[mid]})`;

    await new Promise(r => setTimeout(r, 1200));
    if (epoch !== pageEpoch) return; // navigated away mid-search

    if (values[mid] === target) {
      bars[mid].style.background = 'var(--accent-green)';
      bars[mid].style.transform = 'scale(1.2)';
      status.innerText = `Found ${target} at index ${mid}!`;
      startBtn.disabled = false;
      return;
    }

    if (values[mid] < target) {
      status.innerText = `${values[mid]} is too low. Discarding left half.`;
      low = mid + 1;
    } else {
      status.innerText = `${values[mid]} is too high. Discarding right half.`;
      high = mid - 1;
    }

    await new Promise(r => setTimeout(r, 800));
    if (epoch !== pageEpoch) return;
    bars[mid].style.transform = 'scale(1)';
    if (values[mid] !== target) bars[mid].style.background = '#888';
  }

  status.innerText = "Value not found.";
  startBtn.disabled = false;
}

async function startMergeSort() {
  const container = document.getElementById('merge-viz-container');
  const status = document.getElementById('merge-viz-status');
  const startBtn = document.getElementById('merge-start-btn');
  const epoch = pageEpoch;

  startBtn.disabled = true;
  let values = [42, 31, 52, 26, 15, 60, 10, 88, 5, 22];
  const boxWidth = 50;
  const gap = 30;

  container.innerHTML = '';
  let boxes = values.map((val, i) => {
    const box = document.createElement('div');
    box.innerText = val;
    box.style.cssText = `
      width: ${boxWidth}px; height: ${boxWidth}px;
      background: #888; color: white; line-height: ${boxWidth}px;
      font-weight: bold; position: absolute; border-radius: 4px;
      left: ${i * (boxWidth + gap)}px; top: 10px; 
      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    container.appendChild(box);
    return box;
  });

  async function merge(arr, l, m, r, depth) {
    let n1 = m - l + 1;
    let n2 = r - m;
    let L = arr.slice(l, m + 1);
    let R = arr.slice(m + 1, r + 1);
    let tempBoxes = boxes.slice(l, r + 1);

    let i = 0, j = 0, k = l;
    status.innerText = "Conquer: Merging and swapping sub-lists...";

    while (i < n1 && j < n2) {
      tempBoxes[i].style.background = '#dc3545';
      tempBoxes[n1 + j].style.background = '#dc3545';
      await new Promise(res => setTimeout(res, 600));
      if (epoch !== pageEpoch) throw new Error('aborted');

      if (L[i] <= R[j]) {
        arr[k] = L[i];
        boxes[k] = tempBoxes[i];
        i++;
      } else {
        arr[k] = R[j];
        boxes[k] = tempBoxes[n1 + j];
        j++;
      }

      // Simultaneously move to correct sorted X position and move back UP a level
      boxes[k].style.left = (k * (boxWidth + gap)) + 'px';
      boxes[k].style.top = (depth * 70 + 10) + 'px';
      boxes[k].style.background = 'var(--accent-green)';
      k++;
      await new Promise(res => setTimeout(res, 500));
    }

    while (i < n1 || j < n2) {
      let remBox = (i < n1) ? tempBoxes[i] : tempBoxes[n1 + j];
      let val = (i < n1) ? L[i] : R[j];
      arr[k] = val;
      boxes[k] = remBox;
      boxes[k].style.left = (k * (boxWidth + gap)) + 'px';
      boxes[k].style.top = (depth * 70 + 10) + 'px';
      boxes[k].style.background = 'var(--accent-green)';
      if (i < n1) i++; else j++;
      k++;
      await new Promise(res => setTimeout(res, 300));
      if (epoch !== pageEpoch) throw new Error('aborted');
    }
  }

  async function mergeSort(arr, l, r, depth) {
    if (l >= r) return;
    let m = Math.floor((l + r) / 2);

    // Split: Move the boxes down for this recursion depth (70px per level)
    for (let idx = l; idx <= r; idx++) {
      boxes[idx].style.top = ((depth + 1) * 70 + 10) + 'px';
      boxes[idx].style.background = '#555';
    }
    await new Promise(res => setTimeout(res, 800));
    if (epoch !== pageEpoch) throw new Error('aborted');

    await mergeSort(arr, l, m, depth + 1);
    await mergeSort(arr, m + 1, r, depth + 1);
    await merge(arr, l, m, r, depth);
  }

  // The recursion can't unwind with a plain `return`, so an abort throws and is
  // swallowed here. Any other error is left to surface normally.
  try {
    await mergeSort(values, 0, values.length - 1, 0);
  } catch (e) {
    if (epoch !== pageEpoch) return; // page was torn down mid-animation
    throw e;
  }

  status.innerText = "Merge Sort Complete!";
  startBtn.disabled = false;
}

function runRLE() {
  const input = document.getElementById('rle-input').value;
  const resultDiv = document.getElementById('rle-result');
  if (!input) return;

  let compressed = "";
  let count = 1;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === input[i + 1]) {
      count++;
    } else {
      compressed += count + input[i];
      count = 1;
    }
  }
  resultDiv.innerText = `Result: ${compressed}`;
}

function checkFullHuffman() {
  const val = id => document.getElementById(id).value.trim();
  const sumsCorrect = val('node-sum-6') === '6' && val('node-sum-4') === '4' &&
    val('node-sum-2a') === '2' && val('node-sum-2b') === '2';

  // B, A, E and D each appear once, so any arrangement of them across the
  // four leaves is an equally valid Huffman tree.
  const leaves = [1, 2, 3, 4].map(i => val('node-leaf-' + i).toUpperCase()).sort().join('');
  const isCorrect = sumsCorrect && leaves === 'ABDE';

  const feedback = document.getElementById('huff-feedback');
  if (isCorrect) {
    feedback.innerHTML = "<span style='color: var(--accent-green-text)'>Excellent!</span> You correctly built the tree. 'N' has a 1-bit code and B, A, E and D have 3-bit codes: 2&times;1 + 4&times;3 = 14 bits, compared with 42 bits in 7-bit ASCII.";
  } else {
    feedback.innerHTML = "<span style='color: var(--accent-red-text)'>Incorrect.</span> Check your sums (add the two branches below) and letter placements.";
  }
}

function runThreatLogic(type) {
  const stage = document.getElementById('viz-stage-title');
  const source = document.getElementById('viz-source');
  const path = document.getElementById('viz-path');
  const target = document.getElementById('viz-target');
  const desc = document.getElementById('viz-explanation');

  // Reset visuals
  source.classList.remove('is-idle');
  target.classList.remove('is-idle');
  path.style.color = "var(--accent-green)";

  if (type === 'virus') {
    stage.innerText = "Virus: The Replicator";
    source.innerText = "Infected file";
    target.innerText = "Host PC";
    path.innerText = "──(User Opens File)──>";
    desc.innerHTML = `
      1. <strong>Infection:</strong> Virus hides inside a legitimate file.<br>
      2. <strong>Trigger:</strong> User manually opens the infected file.<br>
      3. <strong>Action:</strong> Replicates into other files to damage or delete data.
    `;
  }
  else if (type === 'worm') {
    stage.innerText = "Worm: The Network Crawler";
    source.innerText = "Worm";
    target.innerText = "Network";
    path.innerText = "──(Auto-Spreading)──>";
    desc.innerHTML = `
      1. <strong>Self-Replication:</strong> Does NOT need a host file or user action.<br>
      2. <strong>Spread:</strong> Uses network vulnerabilities to travel to other devices.<br>
      3. <strong>Impact:</strong> Clogs bandwidth and uses up system resources.
    `;
  }
  else if (type === 'trojan') {
    stage.innerText = "Trojan: The Deceiver";
    source.innerText = "Free download";
    target.innerText = "Backdoor";
    path.innerText = "──(Hidden Backdoor)──>";
    desc.innerHTML = `
      1. <strong>Disguise:</strong> Appears as useful software, like a free game.<br>
      2. <strong>Installation:</strong> User willingly installs the 'gift'.<br>
      3. <strong>Payload:</strong> Creates a 'backdoor' for hackers to access files.
    `;
  }
  else if (type === 'phishing') {
    stage.innerText = "Phishing: The Social Lure";
    source.innerText = "Fake email";
    target.innerText = "Victim";
    path.innerText = "──(Fake Link)──>";
    desc.innerHTML = `
      1. <strong>The Hook:</strong> User receives a fake email appearing to be from a bank.<br>
      2. <strong>The Bait:</strong> User clicks a link to a fake login page.<br>
      3. <strong>The Catch:</strong> User enters credentials, which are stolen by the attacker.
    `;
  }
}

let phishCount = 0;
const totalPhish = 4;

function revealPhish(element, message) {
  if (element.classList.contains('phish-found')) return;

  element.classList.add('phish-found');
  phishCount++;

  const feedback = document.getElementById('phish-feedback');
  feedback.innerHTML = `Found: ${message}<br>Progress: ${phishCount} / ${totalPhish}`;

  if (phishCount === totalPhish) {
    feedback.innerHTML = "Excellent! You spotted all the red flags. Always check the sender, the link, and look out for generic greetings or threats of urgency.";
    phishCount = 0; // Reset for next time
  }
}

async function runAttackLogic(type) {
  const status = document.getElementById('server-status');
  const loadBar = document.getElementById('load-bar');
  const consoleOut = document.getElementById('console-output');
  const epoch = pageEpoch;

  // Reset Server Visuals
  loadBar.style.width = "5%";
  loadBar.style.background = "var(--accent-green)";
  status.innerText = "SERVER STATUS: ONLINE";
  status.style.color = "var(--accent-green)";

  if (type === 'brute') {
    consoleOut.innerHTML = "> Initialising Systematic Brute Force...";
    const targetPassword = "C0mput3r Sc13nc3 R0cks!";
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789!@#%^&*";
    let currentAttempt = "";

    // Video-style visualization: Cracking character by character
    for (let i = 0; i < targetPassword.length; i++) {
      let foundChar = false;

      // Cycle through charset to simulate searching
      for (let j = 0; j < charset.length; j++) {
        const char = charset[j];
        consoleOut.innerHTML = `> Attacking... <br><span style="font-size: 2rem; color: #0f0; letter-spacing: 5px;">${currentAttempt}${char}</span>`;

        // Artificial delay for visual effect
        await new Promise(r => setTimeout(r, 40));
        if (epoch !== pageEpoch) return; // navigated away mid-attack

        if (char === targetPassword[i]) {
          currentAttempt += char;
          foundChar = true;
          break;
        }
      }
    }

    // Final Success State
    consoleOut.innerHTML = `> Success! Password found: <br><span style="font-size: 2rem; color: var(--accent-green-text); letter-spacing: 5px;">${currentAttempt}</span>`;
    status.innerText = "SERVER STATUS: UNAUTHORISED ACCESS";
    status.style.color = "#fd7e14";
  }

  else if (type === 'dos') {
    consoleOut.innerText = "> Flooding server with traffic...";
    let load = 5;
    // Tracked module-side so resetPageState() can stop it on navigation, and so
    // a second click replaces the run instead of stacking a second interval.
    if (dosAttackInterval) clearInterval(dosAttackInterval);
    dosAttackInterval = setInterval(() => {
      load += 15;
      loadBar.style.width = load + "%";
      consoleOut.innerHTML += "<br>> Packet sent...";
      if (load >= 95) {
        clearInterval(dosAttackInterval);
        dosAttackInterval = null;
        loadBar.style.background = "#dc3545";
        status.innerText = "SERVER STATUS: CRASHED (OFFLINE)";
        status.style.color = "#dc3545";
        consoleOut.innerHTML += "<br>> Target down. Service denied.";
      }
    }, 200);
  }

  else if (type === 'sql') {
    consoleOut.innerText = "> Intercepting Login Form...";
    await new Promise(r => setTimeout(r, 800));
    if (epoch !== pageEpoch) return;
    consoleOut.innerHTML += "<br>> Injecting: ' OR 1=1 --";
    await new Promise(r => setTimeout(r, 800));
    if (epoch !== pageEpoch) return;
    consoleOut.innerHTML += "<br>> Database Query Manipulated. Access Granted.";
    status.innerText = "SERVER STATUS: DATA LEAK DETECTED";
    status.style.color = "#dc3545";
  }
}

// --- Daily-refreshing exam dates & homework reminders ---
//
// UPDATE ME EACH ACADEMIC YEAR. Replace these two entries with the current
// series' AQA GCSE Computer Science dates (note: month is 0-indexed, so
// `4` is May). Until they are updated, the dashboard falls back to the
// revision panel below rather than showing stale "Exam Completed" badges.
// Dates taken from AQA's "GCSE Exam Timetable May/June 2027" (version 1.0).
// Paper 1 (8525/1A/1B/1C) Monday 10 May 2027, morning, 2h.
// Paper 2 (8525/2)        Wednesday 19 May 2027, afternoon, 1h 45m.
const EXAM_SCHEDULE = [
  { title: "Paper 1: Computational Thinking and Programming Skills", dateStr: "10/05/2027 (Monday AM, 2h)",       focus: "Algorithms, Programming, and Logic.",         date: new Date(Date.UTC(2027, 4, 10, 9, 0)) },
  { title: "Paper 2: Computing Concepts",                            dateStr: "19/05/2027 (Wednesday PM, 1h 45m)", focus: "Data, Systems, Networks, and Cyber Security.", date: new Date(Date.UTC(2027, 4, 19, 13, 0)) },
];

// DESIGN MOVE 03 -- the countdown leads the dashboard.
// It is the most motivating thing on the site and used to sit fourth, roughly a
// screen down on a phone. This compact strip carries the days remaining, the
// exact sitting, and the single action worth taking next (from move 01).
function renderCountdownHero() {
  const host = document.getElementById('countdown-hero');
  if (!host) return;

  const cutoff = todayUTC();
  const next = EXAM_SCHEDULE
    .filter(e => Date.UTC(e.date.getUTCFullYear(), e.date.getUTCMonth(), e.date.getUTCDate()) >= cutoff)
    .sort((a, b) => a.date - b.date)[0];

  if (!next) { host.innerHTML = ''; return; }

  const examUTC = Date.UTC(next.date.getUTCFullYear(), next.date.getUTCMonth(), next.date.getUTCDate());
  const days = Math.ceil((examUTC - cutoff) / 86400000);
  const weeks = Math.ceil(days / 7);

  const weak = weakestTopics(1)[0];
  const action = weak
    ? `<button class="hero-cta" onclick="loadContent('quiz_trainer')">Revise ${escapeHtml(weak.topic)} &rarr;</button>
       <span class="hero-action-note">Your weakest topic, at ${weak.m.accuracy}%</span>`
    : `<button class="hero-cta" onclick="loadContent('quiz_trainer')">Take your first quiz &rarr;</button>
       <span class="hero-action-note">Answer some questions and this will track your weakest topic</span>`;

  host.innerHTML = `
    <div class="countdown-hero">
      <div class="hero-count">
        <span class="hero-days">${days}</span>
        <span class="hero-days-label">days to ${escapeHtml(next.title.split(':')[0])}</span>
      </div>
      <div class="hero-detail">
        <div class="hero-date">${escapeHtml(next.dateStr)}</div>
        <div class="hero-weeks">${weeks} week${weeks === 1 ? '' : 's'} to go</div>
        <div class="hero-action">${action}</div>
      </div>
    </div>`;
}

function renderExamCards() {
  const container = document.getElementById('exam-cards-container');
  if (!container) return;

  const cutoff = todayUTC();
  const upcoming = EXAM_SCHEDULE.filter(e => Date.UTC(
    e.date.getUTCFullYear(), e.date.getUTCMonth(), e.date.getUTCDate()) >= cutoff);

  // Once every exam in the series has passed the countdowns are meaningless,
  // so show the practice hub instead of two dead "Exam Completed" cards.
  if (upcoming.length === 0) {
    container.innerHTML = `
      <div class="card" style="border-left: 5px solid var(--accent-green);">
        <h3 style="margin-top: 0;">That series is over — nice work</h3>
        <p>There are no exams scheduled right now. Everything on the hub stays open, so you can keep practising whenever you want.</p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
          <a href="#quiz_trainer" class="dash-action">Quiz Trainer</a>
          <a href="#connecting_walls" class="dash-action">Connecting Walls</a>
          <a href="#parsons_puzzles" class="dash-action">Parson's Puzzles</a>
          <a href="#logic_gate_lab" class="dash-action">Logic Gate Lab</a>
          <a href="#visualizations" class="dash-action">Visualizations</a>
        </div>
      </div>`;
    return;
  }

  container.innerHTML = upcoming
    .map(e => createExamCard(e.title, e.dateStr, e.focus, e.date))
    .join('');
}

function renderHomeworkReminders() {
  const container = document.getElementById('homework-reminders-container');
  if (!container) return;
  container.innerHTML = getUpcomingHomeworkHTML();
}

function refreshDailyContent() {
  renderCountdownHero();
  renderStreakStrip();
  renderExamCards();
  renderHomeworkReminders();
}

let dailyMidnightTimer = null;
function msUntilNextMidnightGMT() {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0);
  return next - now.getTime();
}
function scheduleDailyMidnightRefresh() {
  if (dailyMidnightTimer) clearTimeout(dailyMidnightTimer);
  dailyMidnightTimer = setTimeout(() => {
    refreshDailyContent();
    scheduleDailyMidnightRefresh();
  }, msUntilNextMidnightGMT() + 1000);
}


// Full homework schedule from the provided document

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      // Ignore the Flashcards dropdown parent so it doesn't accidentally highlight
      if (this.getAttribute('onclick') && this.getAttribute('onclick').includes('toggleSubMenu')) {
        return;
      }

      // Remove the 'active' class from all links
      document.querySelectorAll('.sidebar-nav .nav-link').forEach(nav => {
        nav.classList.remove('active');
      });

      // Add the 'active' class to the newly clicked link
      this.classList.add('active');
    });
  });
});

// --- LOGIC GATE LAB ENGINE ---
const logicGateLabQuestions = [
    {
        type: "table",
        q: "Complete the truth table for the Boolean expression: Q = A . (B + C)",
        rows: [
            { inputs: "A=1, B=0, C=1", correct: "1" },
            { inputs: "A=1, B=0, C=0", correct: "0" },
            { inputs: "A=0, B=1, C=1", correct: "0" }
        ],
        why: "A must be 1, and at least one of B or C must be 1 for Q to be 1."
    },
    {
        type: "table",
        q: "Complete the truth table for the Boolean expression: Q = ¬(A + B) . C",
        rows: [
            { inputs: "A=0, B=0, C=1", correct: "1" },
            { inputs: "A=0, B=1, C=1", correct: "0" },
            { inputs: "A=1, B=1, C=1", correct: "0" }
        ],
        why: "The NOR part ¬(A+B) only outputs 1 if both A and B are 0."
    },
    {
        q: "Identify the Boolean expression for a circuit where inputs A and B pass through a NOR gate, and the result is ANDed with input C.",
        a: "Q = ¬(A + B) . C",
        options: ["Q = ¬(A + B) . C", "Q = (¬A + ¬B) . C", "Q = ¬(A . B) + C", "Q = ¬(A + B + C)"],
        why: "NOR is represented by ¬(A + B), which is then ANDed (.) with C."
    },
    {
        q: "Simplify the following Boolean expression: Q = A . (B + 0)",
        a: "Q = A . B",
        options: ["Q = A . B", "Q = A + B", "Q = A", "Q = 0"],
        why: "Anything ORed with 0 remains itself, so (B + 0) simplifies to B."
    },
    {
        q: "Determine the output Q for the expression Q = ¬(A . B) + C, given A=1, B=1, and C=0.",
        a: "Q = 0",
        options: ["Q = 0", "Q = 1"],
        why: "¬(1 . 1) + 0 = ¬1 + 0 = 0 + 0 = 0."
    },
    {
        q: "Which Boolean expression represents a circuit where A and B pass through an AND gate, and the result is passed through a NOT gate?",
        a: "Q = ¬(A . B)",
        options: ["Q = ¬(A . B)", "Q = ¬A . ¬B", "Q = ¬A . B", "Q = A . ¬B"],
        why: "This is a NAND operation — the NOT (¬) is applied after the AND."
    },
    {
        q: "Calculate the output Q for the expression Q = (A + B) . ¬B, given A=1 and B=1.",
        a: "Q = 0",
        options: ["Q = 0", "Q = 1"],
        why: "(1 + 1) . ¬1 = 1 . 0 = 0."
    },
    {
        q: "Simplify the Boolean expression: Q = (A . 1) + (B . 0)",
        a: "Q = A",
        options: ["Q = A", "Q = B", "Q = A + B", "Q = 0"],
        why: "(A . 1) is A, and (B . 0) is 0. A + 0 simplifies to A."
    },
    {
        q: "A safety system (S) activates if a Pressure sensor (P) is 1 AND (a Temp sensor (T) is 1 OR a Manual override (M) is 1). What is the expression?",
        a: "S = P . (T + M)",
        options: ["S = P . (T + M)", "S = P + (T . M)", "S = ¬P . (T + M)", "S = (P . T) + M"],
        why: "P must be true, AND at least one of T or M must be true."
    },
    {
        q: "What is the output Q if A=1, B=0, C=1 for Q = (A . B) + ¬C?",
        a: "Q = 0",
        options: ["Q = 0", "Q = 1"],
        why: "(1 . 0) + ¬1 = 0 + 0 = 0."
    },
    {
        q: "Identify the expression for a circuit where A and B go into an AND gate, and the result goes into an OR gate with C.",
        a: "Q = (A . B) + C",
        options: ["Q = (A . B) + C", "Q = A . (B + C)", "Q = ¬(A . B) + C", "Q = (A + B) . C"],
        why: "A and B are ANDed first, then that output is ORed with C."
    },
    {
        q: "An engine warning light (W) is 1 if the Fuel (F) is NOT 1 AND the Ignition (I) is 1. Which expression is correct?",
        a: "W = ¬F . I",
        options: ["W = ¬F . I", "W = F . ¬I", "W = ¬(F . I)", "W = F + ¬I"],
        why: "NOT F ANDed with I."
    },
    {
        q: "What logic gate is represented by the Boolean expression: Q = ¬(A . B)?",
        a: "NAND",
        options: ["NAND", "NOR", "XOR", "AND"],
        why: "NAND = NOT AND."
    },
    {
        q: "What logic gate is represented by the Boolean expression: Q = ¬(A + B)?",
        a: "NOR",
        options: ["NOR", "NAND", "XOR", "OR"],
        why: "NOR = NOT OR."
    },
    {
        q: "Calculate Q where A=0, B=1, C=1: Q = ¬(A + B) . C",
        a: "Q = 0",
        options: ["Q = 0", "Q = 1"],
        why: "¬(0+1) . 1 = ¬1 . 1 = 0 . 1 = 0."
    },
    {
        q: "Which expression represents: 'The motor (M) turns on if Switch A is pressed OR Switch B is pressed, but only if the Guard (G) is closed (1)'?",
        a: "M = (A + B) . G",
        options: ["M = (A + B) . G", "M = A + B . G", "M = (A . B) + G", "M = ¬(A + B) . G"],
        why: "A OR B, ANDed with G to enforce the guard condition."
    },
    {
        q: "In a circuit, A and B pass through an OR gate. The output then passes through a NOT gate. What is the expression?",
        a: "Q = ¬(A + B)",
        options: ["Q = ¬(A + B)", "Q = ¬A + ¬B", "Q = ¬(A . B)", "Q = A + ¬B"],
        why: "OR first, then NOT — that's NOR."
    },
    {
        q: "Find the output Q for A=1, B=1, C=0: Q = A . (B + C)",
        a: "Q = 1",
        options: ["Q = 1", "Q = 0"],
        why: "1 . (1 + 0) = 1 . 1 = 1."
    },
    {
        q: "Simplify the Boolean expression: A + (B . ¬B)",
        a: "A",
        options: ["A", "B", "A + B", "1"],
        why: "B . ¬B is always 0, and A + 0 is always A."
    },
    {
        q: "What is the output of a 3-input AND gate if the inputs are 1, 0, 1?",
        a: "0",
        options: ["0", "1"],
        why: "All inputs must be 1 for an AND gate to output 1."
    },
    {
        q: "Which logic gate outputs 1 ONLY when the inputs are different?",
        a: "XOR",
        options: ["XOR", "OR", "AND", "NAND"],
        why: "XOR (exclusive OR) is true only when inputs differ."
    }
];

let logicLabQueue = [];
let logicLabIndex = 0;
let logicLabScore = 0;

function startLogicGateLab() {
    document.getElementById('logic-lab-intro').style.display = 'none';
    document.getElementById('logic-lab-results').style.display = 'none';
    document.getElementById('logic-lab-active').style.display = 'block';

    logicLabQueue = [...logicGateLabQuestions].sort(() => 0.5 - Math.random());
    logicLabIndex = 0;
    logicLabScore = 0;

    renderLogicLabQuestion();
}

function renderLogicLabQuestion() {
    if (logicLabIndex >= logicLabQueue.length) {
        showLogicLabResults();
        return;
    }

    const qData = logicLabQueue[logicLabIndex];
    document.getElementById('logic-lab-progress').innerText = `Question ${logicLabIndex + 1} of ${logicLabQueue.length}`;
    document.getElementById('logic-lab-question').innerText = qData.q;
    document.getElementById('logic-lab-feedback').innerHTML = '';
    document.getElementById('logic-lab-continue-btn').style.display = 'none';

    const body = document.getElementById('logic-lab-body');
    body.innerHTML = '';

    if (qData.type === 'table') {
        document.getElementById('logic-lab-check-btn').style.display = 'inline-flex';
        let html = `<table class="logic-play-table" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="padding: 12px; border: 1px solid var(--border); text-align: center; background: var(--bg); color: var(--text);">Inputs</th>
                    <th style="padding: 12px; border: 1px solid var(--border); text-align: center; background: var(--bg); color: var(--text);">Output Q</th>
                </tr>
            </thead>
            <tbody>`;
        qData.rows.forEach((row, i) => {
            html += `<tr>
                <td style="padding: 12px; border: 1px solid var(--border); text-align: center; font-family: 'Consolas', monospace; color: var(--text);">${row.inputs}</td>
                <td style="padding: 12px; border: 1px solid var(--border); text-align: center;">
                    <input type="text" class="logic-lab-cell" id="logic-row-${i}" maxlength="1" style="width: 50px; height: 40px; text-align: center; background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 4px; font-size: 1.1rem;">
                </td>
            </tr>`;
        });
        html += `</tbody></table>`;
        body.innerHTML = html;
    } else {
        document.getElementById('logic-lab-check-btn').style.display = 'none';
        const shuffled = [...qData.options].sort(() => 0.5 - Math.random());
        shuffled.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'logic-lab-option';
            btn.dataset.option = opt;      // matched on, rather than rendered text
            btn.textContent = opt;
            btn.onclick = () => handleLogicLabAnswer(btn, opt, qData);
            body.appendChild(btn);
        });
    }
}

function handleLogicLabAnswer(btnEl, choice, qData) {
    const buttons = document.querySelectorAll('.logic-lab-option');
    buttons.forEach(b => {
        b.disabled = true;
        const value = b.dataset.option;    // never b.innerText
        if (value === qData.a) b.classList.add('correct');
        else if (value === choice) b.classList.add('wrong');
    });

    const feedback = document.getElementById('logic-lab-feedback');
    if (choice === qData.a) {
        logicLabScore++;
        updateXP(25);
        feedback.innerHTML = `Correct! <span style="color: var(--accent-green-text);">+25 XP</span>`;
        feedback.style.color = "var(--accent-green)";
    } else {
        feedback.innerHTML = `Incorrect. ${qData.why || ''}`;
        feedback.style.color = "var(--accent-red)";
    }
    document.getElementById('logic-lab-continue-btn').style.display = 'inline-flex';
}

function checkLogicLabTable() {
    const qData = logicLabQueue[logicLabIndex];
    let allCorrect = true;

    qData.rows.forEach((row, i) => {
        const input = document.getElementById(`logic-row-${i}`);
        if (!input) return;
        if (input.value.trim() === row.correct) {
            input.style.borderColor = "var(--accent-green)";
        } else {
            input.style.borderColor = "var(--accent-red)";
            allCorrect = false;
        }
        input.disabled = true;
    });

    const feedback = document.getElementById('logic-lab-feedback');
    if (allCorrect) {
        logicLabScore++;
        updateXP(25);
        feedback.innerHTML = `Perfect! Truth table completed correctly. <span style="color: var(--accent-green-text);">+25 XP</span>`;
        feedback.style.color = "var(--accent-green)";
    } else {
        feedback.innerHTML = `Not quite. ${qData.why || ''}`;
        feedback.style.color = "var(--accent-red)";
    }

    document.getElementById('logic-lab-check-btn').style.display = 'none';
    document.getElementById('logic-lab-continue-btn').style.display = 'inline-flex';
}

function nextLogicLabQuestion() {
    logicLabIndex++;
    renderLogicLabQuestion();
}

function showLogicLabResults() {
    document.getElementById('logic-lab-active').style.display = 'none';
    document.getElementById('logic-lab-results').style.display = 'block';
    const total = logicLabQueue.length;
    const xpEarned = logicLabScore * 25;
    document.getElementById('logic-lab-final').innerHTML = `You answered <b>${logicLabScore}</b> out of <b>${total}</b> correctly.<br><span style="color: var(--accent-green-text);">Earned +${xpEarned} XP this session!</span>`;
}

// --- PARSON'S PUZZLES ENGINE ---
// Standard Puzzles (Sneakier distractors)
const parsonsBank = {
    'Basics': [
        {
            q: "Construct a program that asks for a name and greets the user.",
            code: [
                "name = input('What is your name?')",
                "print('Hello ' + name)"
            ],
            distractors: [
                "print('Hello' + name)", // Missing space
                "name = print('What is your name?')" // Logic error
            ]
        }
    ],
    'If statements': [
        {
            q: "Create a program that checks if a user is old enough to drive (17 or older).",
            code: [
                "age = int(input('Enter age:'))",
                "if age >= 17:",
                "    print('You can drive!')",
                "else:",
                "    print('Too young.')"
            ],
            distractors: [
                "if age > 17:", // Logic error (misses exactly 17)
                "    input('You can drive!')", // Syntax error
                "else" // Missing colon
            ]
        }
    ],
    'Strings': [
        {
            q: "Ask for a password and output its length.",
            code: [
                "pwd = input('Enter password:')",
                "length = len(pwd)",
                "print('Length is', length)"
            ],
            distractors: [
                "length = pwd.len()", // Incorrect method call
                "length = len[pwd]" // Using square brackets
            ]
        }
    ],
    'Maths': [
        {
            q: "Calculate and print the area of a rectangle.",
            code: [
                "width = int(input('Width:'))",
                "length = int(input('Length:'))",
                "area = width * length",
                "print(area)"
            ],
            distractors: [
                "area = width + length", // Wrong math operation
                "width = input('Width:')" // Missing integer cast
            ]
        }
    ],
    'For loops': [
        {
            q: "Write a loop that prints the numbers 1 to 5 (inclusive).",
            code: [
                "for i in range(1, 6):",
                "    print(i)"
            ],
            distractors: [
                "for i in range(1, 5):", // Off-by-one error
                "    print[i]" // Syntax error
            ]
        }
    ],
    'While loops': [
        {
            q: "Create a loop that keeps asking for a password until it equals 'secret'.",
            code: [
                "guess = ''",
                "while guess != 'secret':",
                "    guess = input('Password?')"
            ],
            distractors: [
                "while guess == 'secret':", // Logic inverted
                "while guess != 'secret'" // Missing colon
            ]
        }
    ],
    'Random': [
        {
            q: "Import the random library and simulate rolling a 6-sided die.",
            code: [
                "import random",
                "roll = random.randint(1, 6)",
                "print(roll)"
            ],
            distractors: [
                "roll = random.randint(1, 7)", // Wrong range
                "roll = random(1, 6)" // Missing module method
            ]
        }
    ],
    'Lists': [
        {
            q: "Create a list of colours, append 'Yellow', and print the list.",
            code: [
                "colours = ['Red', 'Blue', 'Green']",
                "colours.append('Yellow')",
                "print(colours)"
            ],
            distractors: [
                "colours.add('Yellow')", // Wrong python method
                "colours = ('Red', 'Blue', 'Green')" // Tuple instead of list
            ]
        }
    ],
    'Strings part 2': [
        {
            q: "Convert a word to uppercase and print its first letter.",
            code: [
                "word = input('Enter word:')",
                "word = word.upper()",
                "print(word[0])"
            ],
            distractors: [
                "word = word.upper", // Missing parenthesis
                "print(word[1])" // Wrong index for first letter
            ]
        }
    ],
    'Numeric Arrays': [
        {
            q: "Calculate the total sum of an array of scores.",
            code: [
                "scores = [85, 90, 78]",
                "total = 0",
                "for s in scores:",
                "    total = total + s"
            ],
            distractors: [
                "for s in range(scores):", // Incorrect iteration
                "    total = total + 1" // Counting instead of summing
            ]
        }
    ],
    '2D lists': [
        {
            q: "Access and print the number 5 from this 3x3 grid.",
            code: [
                "grid = [[1, 2, 3],",
                "        [4, 5, 6],",
                "        [7, 8, 9]]",
                "print(grid[1][1])"
            ],
            distractors: [
                "print(grid[2][2])", // Wrong index (0-based)
                "print(grid[1, 1])" // Wrong 2D access syntax
            ]
        }
    ],
    'Reading and writing to a text file': [
        {
            q: "Open a file called 'scores.txt' and write the word 'Winner'.",
            code: [
                "file = open('scores.txt', 'w')",
                "file.write('Winner')",
                "file.close()"
            ],
            distractors: [
                "file = open('scores.txt', 'r')", // Wrong mode (read instead of write)
                "file.write(Winner)" // Missing quotes
            ]
        }
    ],
    'Subprograms': [
        {
            q: "Create a function that adds two numbers and returns the result.",
            code: [
                "def add_nums(a, b):",
                "    ans = a + b",
                "    return ans"
            ],
            distractors: [
                "function add_nums(a, b):", // JS syntax instead of Python
                "    print(ans)" // Returning vs Printing
            ]
        }
    ]
};

// Challenge Puzzles (Faded Inputs - Harder Variants)
const challengeParsonsBank = {
    'Basics': [
        {
            q: "Fill in the blanks to ask for two numbers, cast them as integers, and output their sum.",
            code: [
                "num1 = <input type='text' class='parsons-input' data-answer='int'>(input('Enter first number: '))",
                "num2 = int(<input type='text' class='parsons-input' data-answer='input'>('Enter second number: '))",
                "total = num1 <input type='text' class='parsons-input' data-answer='+'> num2",
                "print('Total is: ' + <input type='text' class='parsons-input' data-answer='str'>(total))"
            ],
            distractors: [
                "total = <input type='text' class='parsons-input' data-answer='int'>(num1) + int(num2)", 
                "print('Total is: ' <input type='text' class='parsons-input' data-answer='+'> total)",
                "num2 = <input type='text' class='parsons-input' data-answer='input'>('Enter second number: ')"
            ]
        }
    ],
    'If statements': [
        {
            q: "Fill in the blanks to create an ELIF ladder for grading a test score.",
            code: [
                "score = int(input('Score: '))",
                "if score <input type='text' class='parsons-input' data-answer='>='> 80:",
                "    print('Distinction')",
                "<input type='text' class='parsons-input' data-answer='elif'> score >= 60<input type='text' class='parsons-input' data-answer=':'>",
                "    print('Merit')",
                "<input type='text' class='parsons-input' data-answer='else'>:",
                "    print('Fail')"
            ],
            distractors: [
                "<input type='text' class='parsons-input' data-answer='else'> if score >= 60:",
                "<input type='text' class='parsons-input' data-answer='if'> score >= 60:",
                "<input type='text' class='parsons-input' data-answer='else'> score < 60:"
            ]
        }
    ],
    'Strings': [
        {
            q: "Fill in the blanks to extract the first 4 letters, and also reverse the entire string.",
            code: [
                "word = 'Algorithms'",
                "prefix = word[<input type='text' class='parsons-input' data-answer='0'>:<input type='text' class='parsons-input' data-answer='4'>]",
                "reversed_word = word[::<input type='text' class='parsons-input' data-answer='-1'>]",
                "print(prefix, reversed_word)"
            ],
            distractors: [
                "prefix = word[<input type='text' class='parsons-input' data-answer='1'>:<input type='text' class='parsons-input' data-answer='4'>]",
                "reversed_word = word[<input type='text' class='parsons-input' data-answer='-1'>::]",
                "reversed_word = word.<input type='text' class='parsons-input' data-answer='reverse'>()"
            ]
        }
    ],
    'Maths': [
        {
            q: "Fill in the blanks to separate a 2-digit number into its Tens and Units using integer division and modulo.",
            code: [
                "num = int(input('Enter a 2-digit number: '))",
                "tens = num <input type='text' class='parsons-input' data-answer='//'> 10",
                "units = num <input type='text' class='parsons-input' data-answer='%'> 10",
                "print('Tens:', tens, 'Units:', units)"
            ],
            distractors: [
                "tens = num <input type='text' class='parsons-input' data-answer='/'> 10",
                "units = num <input type='text' class='parsons-input' data-answer='//'> 10",
                "units = num <input type='text' class='parsons-input' data-answer='%'> 100"
            ]
        }
    ],
    'For loops': [
        {
            q: "Fill in the blanks to create a countdown from 10 down to 1 (inclusive) using a step parameter.",
            code: [
                "for count in range(<input type='text' class='parsons-input' data-answer='10'>, <input type='text' class='parsons-input' data-answer='0'>, <input type='text' class='parsons-input' data-answer='-1'>):",
                "    print(count)",
                "print('Blastoff!')"
            ],
            distractors: [
                "for count in range(<input type='text' class='parsons-input' data-answer='10'>, <input type='text' class='parsons-input' data-answer='1'>, <input type='text' class='parsons-input' data-answer='-1'>):",
                "for count in range(<input type='text' class='parsons-input' data-answer='10'>, <input type='text' class='parsons-input' data-answer='0'>):",
                "    print[<input type='text' class='parsons-input' data-answer='count'>]"
            ]
        }
    ],
    'While loops': [
        {
            q: "Fill in the blanks to create a boolean flag loop that validates a password length.",
            code: [
                "valid = <input type='text' class='parsons-input' data-answer='False'>",
                "while <input type='text' class='parsons-input' data-answer='not'> valid:",
                "    pwd = input('New password: ')",
                "    if len(pwd) >= 8:",
                "        valid = <input type='text' class='parsons-input' data-answer='True'>",
                "    else:",
                "        print('Too short!')"
            ],
            distractors: [
                "while valid:",
                "while valid <input type='text' class='parsons-input' data-answer='='> False:",
                "    if pwd.<input type='text' class='parsons-input' data-answer='len'>() >= 8:"
            ]
        }
    ],
    'Random': [
        {
            q: "Fill in the blanks to simulate a 'Guess the Number' game loop.",
            code: [
                "import random",
                "target = random.<input type='text' class='parsons-input' data-answer='randint'>(1, 100)",
                "guess = 0",
                "while guess <input type='text' class='parsons-input' data-answer='!='> target:",
                "    guess = int(input('Guess: '))",
                "print('You got it!')"
            ],
            distractors: [
                "target = random.<input type='text' class='parsons-input' data-answer='choice'>(1, 100)",
                "while guess <input type='text' class='parsons-input' data-answer='not'> target:",
                "    guess = <input type='text' class='parsons-input' data-answer='input'>('Guess: ')"
            ]
        }
    ],
    'Lists': [
        {
            q: "Fill in the blanks to iterate through a list and append only the EVEN numbers to a new list.",
            code: [
                "nums = [5, 12, 18, 7, 20]",
                "evens = <input type='text' class='parsons-input' data-answer='[]'>",
                "for n in nums:",
                "    if n % 2 <input type='text' class='parsons-input' data-answer='=='> 0:",
                "        evens.<input type='text' class='parsons-input' data-answer='append'>(n)",
                "print(evens)"
            ],
            distractors: [
                "evens = <input type='text' class='parsons-input' data-answer='()'>",
                "    if n % 2 <input type='text' class='parsons-input' data-answer='='> 0:",
                "        evens.<input type='text' class='parsons-input' data-answer='add'>(n)"
            ]
        }
    ],
    'Strings part 2': [
        {
            q: "Fill in the blanks to split an email address into username and domain parts.",
            code: [
                "email = 'student@school.com'",
                "parts = email.<input type='text' class='parsons-input' data-answer='split'>(<input type='text' class='parsons-input' data-answer=\"'@'\">)",
                "user = parts[<input type='text' class='parsons-input' data-answer='0'>]",
                "domain = parts[<input type='text' class='parsons-input' data-answer='1'>]",
                "print('Welcome', user)"
            ],
            distractors: [
                "parts = email.<input type='text' class='parsons-input' data-answer='slice'>(<input type='text' class='parsons-input' data-answer=\"'@'\">)",
                "user = parts[<input type='text' class='parsons-input' data-answer='1'>]",
                "domain = parts[<input type='text' class='parsons-input' data-answer='2'>]"
            ]
        }
    ],
    'Numeric Arrays': [
        {
            q: "Fill in the blanks to write a linear search finding the MAXIMUM value in an array.",
            code: [
                "scores = [45, 78, 92, 34]",
                "highest = scores[<input type='text' class='parsons-input' data-answer='0'>]",
                "for s in scores:",
                "    if s <input type='text' class='parsons-input' data-answer='>'> highest:",
                "        highest = <input type='text' class='parsons-input' data-answer='s'>",
                "print('Top score is', highest)"
            ],
            distractors: [
                "highest = <input type='text' class='parsons-input' data-answer='0'>",
                "    if s <input type='text' class='parsons-input' data-answer='<'> highest:",
                "        highest = scores[<input type='text' class='parsons-input' data-answer='s'>]"
            ]
        }
    ],
    '2D lists': [
        {
            q: "Fill in the blanks to use nested loops to print every single element in a 2D grid.",
            code: [
                "grid = [[1, 2], [3, 4], [5, 6]]",
                "for row in <input type='text' class='parsons-input' data-answer='range'>(len(grid)):",
                "    for col in range(len(grid[<input type='text' class='parsons-input' data-answer='row'>])):",
                "        print(grid[<input type='text' class='parsons-input' data-answer='row'>][<input type='text' class='parsons-input' data-answer='col'>])"
            ],
            distractors: [
                "for row in <input type='text' class='parsons-input' data-answer='len'>(grid):",
                "        print(grid[<input type='text' class='parsons-input' data-answer='col'>][<input type='text' class='parsons-input' data-answer='row'>])",
                "    for col in range(<input type='text' class='parsons-input' data-answer='len'>(grid)):"
            ]
        }
    ],
    'Reading and writing to a text file': [
        {
            q: "Fill in the blanks to open a file in APPEND mode and add multiple entries using a loop.",
            code: [
                "file = open('log.txt', <input type='text' class='parsons-input' data-answer=\"'a'\">)",
                "for i in range(3):",
                "    entry = input('Log: ')",
                "    file.<input type='text' class='parsons-input' data-answer='write'>(entry + <input type='text' class='parsons-input' data-answer=\"'\\n'\">)",
                "file.<input type='text' class='parsons-input' data-answer='close'>()"
            ],
            distractors: [
                "file = open('log.txt', <input type='text' class='parsons-input' data-answer=\"'w'\">)",
                "    file.<input type='text' class='parsons-input' data-answer='append'>(entry + <input type='text' class='parsons-input' data-answer=\"'\\n'\">)",
                "file.<input type='text' class='parsons-input' data-answer='end'>()"
            ]
        }
    ],
    'Subprograms': [
        {
            q: "Fill in the blanks to create a function that returns True if a number is even, and False otherwise.",
            code: [
                "<input type='text' class='parsons-input' data-answer='def'> is_even(number):",
                "    if number % 2 == 0:",
                "        <input type='text' class='parsons-input' data-answer='return'> True",
                "    <input type='text' class='parsons-input' data-answer='return'> False",
                "result = <input type='text' class='parsons-input' data-answer='is_even'>(15)"
            ],
            distractors: [
                "<input type='text' class='parsons-input' data-answer='function'> is_even(number):",
                "    <input type='text' class='parsons-input' data-answer='print'>(True)",
                "result = <input type='text' class='parsons-input' data-answer='call'> is_even(15)"
            ]
        }
    ]
};

// --- PARSON'S PUZZLES LOGIC ---
let currentParsonsPuzzle = null;
// Latched once a puzzle has paid out, so re-clicking "Check" on an
// already-correct solution can't award +100 XP over and over.
let parsonsSolved = false;

function startParsonsPuzzle(topic, isChallenge = false) {
    parsonsSolved = false;
    document.getElementById('parsons-selection-menu').style.display = 'none';
    document.getElementById('parsons-active-area').style.display = 'block';

    // Safety Check: Do the data banks exist?
    if (typeof parsonsBank === 'undefined' || typeof challengeParsonsBank === 'undefined') {
        document.getElementById('parsons-question-text').innerHTML = "<b>Error:</b> parsonsBank is missing!";
        return;
    }

    const activeBank = isChallenge ? challengeParsonsBank : parsonsBank;

    // Safety Check: Does the topic exist?
    if (!activeBank[topic] || activeBank[topic].length === 0) {
        document.getElementById('parsons-question-text').innerHTML = `<b>Error:</b> Could not find puzzles for "${topic}"!`;
        return;
    }
    
    const displayMode = isChallenge ? "CHALLENGE MODE" : "STANDARD";
    document.getElementById('parsons-topic-display').innerText = `TOPIC: ${topic} [${displayMode}]`;
    
    currentParsonsPuzzle = activeBank[topic][0];
    
    // Fallback: Checks for .q, then .question, then defaults to a generic prompt
    const questionText = currentParsonsPuzzle.q || currentParsonsPuzzle.question || "Arrange the blocks into the correct order:";
    
    const questionBox = document.getElementById('parsons-question-text');
    questionBox.innerHTML = questionText;
    
    // Fix: Forces the text to use your global text colour so it doesn't vanish in light mode!
    questionBox.style.color = "var(--text, #1e293b)";
    
    renderParsonsBlocks();
}

function renderParsonsBlocks() {
    const sourceZone = document.getElementById('parsons-source');
    const solutionZone = document.getElementById('parsons-solution');
    const feedback = document.getElementById('parsons-feedback');
    
    if (feedback) feedback.innerText = '';
    sourceZone.innerHTML = '';
    solutionZone.innerHTML = '';
    
    let allBlocks = [];
    
    // Add correct lines
    if (currentParsonsPuzzle.code) {
        currentParsonsPuzzle.code.forEach((line, index) => {
            allBlocks.push({ id: `correct-${index}`, text: line });
        });
    }
    
    // Add distractors if they exist
    if (currentParsonsPuzzle.distractors) {
        currentParsonsPuzzle.distractors.forEach((line, index) => {
            allBlocks.push({ id: `distractor-${index}`, text: line });
        });
    }
    
    // Shuffle all blocks
    allBlocks.sort(() => Math.random() - 0.5);
    
    allBlocks.forEach(block => {
        const div = document.createElement('div');
        div.className = 'parsons-block';
        div.id = `block-${block.id}`;
        div.draggable = true;
        div.ondragstart = parsonsDrag;
        div.innerHTML = block.text;
        sourceZone.appendChild(div);
    });

    // Deterministic rather than waiting on the MutationObserver's microtask.
    enhanceRenderedPage(sourceZone);
    enhanceRenderedPage(solutionZone);
}

// --- PARSON'S PUZZLE DRAG AND DROP API ---
// Named separately from the generic match-up handlers (allowDrop/drag/drop)
// above: identical names previously redeclared them and broke the drag-match
// activities on the Systems and Networks pages.

function parsonsAllowDrop(ev) {
    ev.preventDefault();
}

function parsonsDrag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

// Shared by the native drop handler and the touch shim.
// `closest` rather than a bare classList check on the event target: challenge
// blocks contain <input> children, so dropping onto one of those used to match
// neither branch and the block silently snapped back.
function performParsonsDrop(block, dropTarget) {
    if (!block || !dropTarget) return false;

    const zone = dropTarget.closest('.parsons-dropzone');
    const overBlock = dropTarget.closest('.parsons-block');

    if (overBlock && overBlock !== block) {
        overBlock.parentNode.insertBefore(block, overBlock);
        return true;
    }
    if (zone) {
        zone.appendChild(block);
        return true;
    }
    return false;
}

function parsonsDrop(ev) {
    ev.preventDefault();
    const block = document.getElementById(ev.dataTransfer.getData("text"));
    performParsonsDrop(block, ev.target);
}

// --- KEYBOARD DRAG ALTERNATIVE ---
//
// Dragging is inherently pointer-only, so the match-up activities and Parson's
// puzzles stayed unusable by keyboard even after every clickable div was made
// operable. These give both a non-drag route to the same result.
//
// Match-up: Enter/Space picks a tile up, then Enter/Space on a drop zone places
// it -- the standard "select then place" pattern.
// Parson's:  Up/Down reorder a block, Enter/Space moves it between the source
// list and the solution list.
let heldTile = null;

function setHeldTile(tile) {
  if (heldTile) {
    heldTile.classList.remove('kb-held');
    heldTile.setAttribute('aria-grabbed', 'false');
  }
  heldTile = tile;
  if (tile) {
    tile.classList.add('kb-held');
    tile.setAttribute('aria-grabbed', 'true');
  }
}

function announce(msg) {
  const live = document.getElementById('a11y-live');
  if (live) live.textContent = msg;
}

document.addEventListener('keydown', ev => {
  const isActivate = ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar';
  const block = ev.target.closest && ev.target.closest('.parsons-block');

  // --- Parson's puzzle blocks ---
  if (block) {
    const zone = block.parentElement;
    if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
      ev.preventDefault();
      const sibs = [...zone.querySelectorAll(':scope > .parsons-block')];
      const i = sibs.indexOf(block);
      const j = ev.key === 'ArrowUp' ? i - 1 : i + 1;
      if (j < 0 || j >= sibs.length) return;
      if (ev.key === 'ArrowUp') zone.insertBefore(block, sibs[j]);
      else zone.insertBefore(block, sibs[j].nextSibling);
      block.focus();
      announce(`Moved to position ${j + 1} of ${sibs.length}`);
      return;
    }
    if (isActivate) {
      ev.preventDefault();
      const source = document.getElementById('parsons-source');
      const solution = document.getElementById('parsons-solution');
      const target = zone === solution ? source : solution;
      if (!target) return;
      target.appendChild(block);
      block.focus();
      announce(target === solution ? 'Moved into your solution' : 'Returned to the available lines');
      return;
    }
    return;
  }

  if (!isActivate) return;

  // --- Match-up tiles and their drop zones ---
  const tile = ev.target.closest && ev.target.closest('.draggable-role[draggable="true"]');
  if (tile) {
    ev.preventDefault();
    setHeldTile(heldTile === tile ? null : tile);
    announce(heldTile ? `${tile.innerText} picked up. Choose a category to place it in.` : 'Cancelled');
    return;
  }

  const zone = ev.target.closest && ev.target.closest('.drop-zone');
  if (zone && heldTile) {
    ev.preventDefault();
    const moved = heldTile;
    performMatchDrop(moved, zone);
    const placed = zone.contains(moved);
    setHeldTile(null);
    (placed ? zone : moved).focus();
    announce(document.getElementById('game-feedback')?.innerText || '');
  }
});

// --- TOUCH DRAG SHIM ---
//
// HTML5 drag-and-drop (dragstart/dragover/drop) simply does not fire for touch
// input. Every match-up activity and every Parson's puzzle was therefore
// impossible to complete on a phone or tablet -- which is most of how students
// actually open this site. Pointer Events do fire for touch and pen, so this
// translates a press-drag-release gesture into the same performMatchDrop /
// performParsonsDrop calls the mouse path uses.
//
// Mouse is deliberately left on native DnD: it already works, and hijacking it
// would risk regressing the desktop experience for no gain.
(() => {
  let src = null;      // the element being dragged
  let ghost = null;    // the visual copy that follows the finger
  let offsetX = 0, offsetY = 0;
  let edgeScroll = 0;  // px per frame; non-zero while the finger is near an edge
  let scrollFrame = null;

  const DRAGGABLE = '[draggable="true"], .parsons-block';
  const EDGE = 70;     // how close to the viewport edge auto-scroll kicks in
  const MAX_SPEED = 14;

  // touch-action: none stops the browser scrolling during a drag, so on a short
  // phone screen the source and the drop zone might not be visible at the same
  // time. Dragging towards the top or bottom edge scrolls the page instead.
  //
  // setInterval rather than requestAnimationFrame: rAF is throttled to zero
  // whenever the page is not compositing, which would silently freeze the
  // scroll. A 16ms timer keeps running regardless.
  function setEdgeScroll(clientY) {
    if (clientY < EDGE) edgeScroll = -Math.ceil(MAX_SPEED * (EDGE - clientY) / EDGE);
    else if (clientY > innerHeight - EDGE) edgeScroll = Math.ceil(MAX_SPEED * (clientY - (innerHeight - EDGE)) / EDGE);
    else edgeScroll = 0;

    if (edgeScroll && !scrollFrame) {
      scrollFrame = setInterval(() => {
        if (!src || !edgeScroll) return;
        window.scrollBy(0, edgeScroll);
      }, 16);
    } else if (!edgeScroll && scrollFrame) {
      clearInterval(scrollFrame);
      scrollFrame = null;
    }
  }

  function cleanUp() {
    if (ghost) ghost.remove();
    if (src) src.classList.remove('drag-source');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    if (scrollFrame) clearInterval(scrollFrame);
    scrollFrame = null;
    edgeScroll = 0;
    src = null;
    ghost = null;
  }

  // What is under the finger, ignoring the ghost that sits directly beneath it.
  function elementUnder(x, y) {
    if (ghost) ghost.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    if (ghost) ghost.style.display = '';
    return el;
  }

  document.addEventListener('pointerdown', ev => {
    if (ev.pointerType === 'mouse' || !ev.isPrimary) return;

    // Let taps on real form controls through -- challenge blocks contain inputs
    // that the student needs to focus and type into.
    if (ev.target.closest('input, textarea, select, button')) return;

    const candidate = ev.target.closest(DRAGGABLE);
    if (!candidate) return;
    // Solved match-up tiles set draggable="false"; respect that.
    if (candidate.getAttribute('draggable') === 'false') return;

    src = candidate;
    const rect = src.getBoundingClientRect();
    offsetX = ev.clientX - rect.left;
    offsetY = ev.clientY - rect.top;

    ghost = src.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    ghost.style.left = rect.left + 'px';
    ghost.style.top = rect.top + 'px';
    document.body.appendChild(ghost);
    src.classList.add('drag-source');

    // Claim the gesture so the page does not scroll underneath the drag.
    // Throws for an inactive pointer id in some browsers; the drag still works
    // via the document-level listeners, so failure here is not fatal.
    try { src.setPointerCapture(ev.pointerId); } catch (e) { /* non-fatal */ }
    ev.preventDefault();
  }, { passive: false });

  document.addEventListener('pointermove', ev => {
    if (!src || !ghost) return;
    ev.preventDefault();
    ghost.style.left = (ev.clientX - offsetX) + 'px';
    ghost.style.top = (ev.clientY - offsetY) + 'px';
    setEdgeScroll(ev.clientY);

    const under = elementUnder(ev.clientX, ev.clientY);
    const zone = under && under.closest('.drop-zone, .parsons-dropzone');
    document.querySelectorAll('.drag-over').forEach(el => {
      if (el !== zone) el.classList.remove('drag-over');
    });
    if (zone) zone.classList.add('drag-over');
  }, { passive: false });

  function finish(ev) {
    if (!src) return;
    const dragged = src;
    const under = elementUnder(ev.clientX, ev.clientY);
    cleanUp();
    if (!under) return;

    if (dragged.classList.contains('parsons-block')) performParsonsDrop(dragged, under);
    else performMatchDrop(dragged, under);
  }

  document.addEventListener('pointerup', finish);
  document.addEventListener('pointercancel', cleanUp);
})();

// Treat 'x' and "x" alike, and ignore spacing around a typed answer.
function parsonsNormalise(text) {
    return String(text).trim().replace(/"/g, "'");
}

// A block's code as text, with each blank shown as a placeholder ('blank') so
// two lines can be compared by shape before their typed answers are checked.
function parsonsLineText(el, mode) {
    const copy = el.cloneNode(true);
    copy.querySelectorAll('.parsons-input').forEach(input => {
        input.replaceWith(document.createTextNode(mode === 'blank' ? '□' : input.value));
    });
    return copy.textContent.replace(/"/g, "'").replace(/\s+$/, '');
}

function checkParsonsSolution() {
    if (parsonsSolved) return; // already paid out for this puzzle

    const solutionZone = document.getElementById('parsons-solution');
    const blocks = solutionZone.querySelectorAll('.parsons-block');
    const feedback = document.getElementById('parsons-feedback');

    if (blocks.length !== currentParsonsPuzzle.code.length) {
        feedback.innerText = "Incorrect number of lines used.";
        feedback.style.color = "var(--accent-red)";
        return;
    }

    // Compare the code the student actually built with the model answer,
    // rather than which block they used. Some distractors look identical to a
    // correct line until their blank is filled (e.g. `units = num __ 10`), so
    // checking block ids marked correct code wrong when the "other" copy of an
    // identical-looking block was chosen.
    const expected = currentParsonsPuzzle.code.map(line => {
        const tmp = document.createElement('div');
        tmp.innerHTML = line;
        return tmp;
    });

    let isOrderCorrect = true;
    let areInputsCorrect = true;
    const inputs = solutionZone.querySelectorAll('.parsons-input');

    blocks.forEach((block, index) => {
        const model = expected[index];
        if (parsonsLineText(block, 'blank') !== parsonsLineText(model, 'blank')) {
            isOrderCorrect = false;
            return;
        }
        const answers = [...model.querySelectorAll('.parsons-input')].map(i => i.dataset.answer);
        block.querySelectorAll('.parsons-input').forEach((input, i) => {
            if (parsonsNormalise(input.value) !== parsonsNormalise(answers[i])) {
                areInputsCorrect = false;
                input.style.borderColor = "var(--accent-red)";
            } else {
                input.style.borderColor = "var(--accent-green)";
            }
        });
    });
    
    if (isOrderCorrect && areInputsCorrect) {
        parsonsSolved = true;
        feedback.innerHTML = `Perfect! Code and syntax are correct.<br><span style="color: var(--accent-green-text); font-size: 1.1rem; margin-top: 5px; display: inline-block;">+100 XP</span>`;
        feedback.style.color = "var(--accent-green)";
        updateXP(100); // Award XP!

        // Lock the puzzle down: dragging, typing and the Check button itself.
        blocks.forEach(b => b.draggable = false);
        inputs.forEach(i => i.disabled = true);
        const checkBtn = document.getElementById('parsons-check-btn');
        if (checkBtn) {
            checkBtn.style.pointerEvents = 'none';
            checkBtn.style.opacity = '0.4';
        }

    } else if (!isOrderCorrect) {
        feedback.innerText = "Not quite right. Check your structure and distractors.";
        feedback.style.color = "var(--accent-red)";
    } else if (!areInputsCorrect) {
        feedback.innerText = "The blocks are in the right order, but check your typed answers!";
        feedback.style.color = "var(--accent-red)";
    }
}


function initApp() {
  registerVisit();          // move 02: count today before anything renders
  updateGlobalUI();
  observeDisplayArea();
  startRouting();
  scheduleDailyMidnightRefresh();
}
