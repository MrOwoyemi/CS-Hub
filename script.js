const contentData = {
  home: `
    <h1>Student Dashboard</h1>
    <p>Welcome back! Here is your current progress and upcoming deadlines.</p>
    
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

    <h2 style="margin-top: 40px; color: var(--accent-red);">⚠️ Final GCSE Exam Dates</h2>
    
    <div class="homework-card" style="border-left: 6px solid var(--accent-red); background: #fff5f5;">
      <div class="homework-info">
        <h4>Paper 1: Computational Thinking and Programming Skills</h4>
        <p style="font-size: 1.4rem; color: var(--accent-red); margin: 10px 0;">
            <strong>Exam Date: 13/05/2026 (Wednesday AM)</strong>
        </p>
        <p>Focus: Algorithms, Programming, and Logic.</p>
        <p id="p1-breakdown" style="font-size: 0.85rem; color: #555; font-style: italic;"></p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        <div class="countdown-tag urgent" data-due="2026-05-13">Calculating...</div>
        <div class="weeks-tag" data-due="2026-05-13" style="font-size: 1rem; color: #333; font-weight: bold;"></div>
      </div>
    </div>

    <div class="homework-card" style="border-left: 6px solid var(--accent-red); background: #fff5f5; margin-bottom: 40px;">
      <div class="homework-info">
        <h4>Paper 2: Computing Concepts</h4>
        <p style="font-size: 1.4rem; color: var(--accent-red); margin: 10px 0;">
            <strong>Exam Date: 19/05/2026 (Tuesday PM)</strong>
        </p>
        <p>Focus: Data, Systems, Networks, and Cyber Security.</p>
        <p id="p2-breakdown" style="font-size: 0.85rem; color: #555; font-style: italic;"></p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        <div class="countdown-tag urgent" data-due="2026-05-19">Calculating...</div>
        <div class="weeks-tag" data-due="2026-05-19" style="font-size: 1rem; color: #333; font-weight: bold;"></div>
      </div>
    </div>

    <h2 style="margin-top: 40px;">Year 11 Homework Reminders</h2>
    
    <div class="homework-card" style="border-left: 6px solid var(--dark-purple);">
      <div class="homework-info">
        <h4>3.5 Computer networks (Hardware & Protocols)</h4>
        <p><strong>Due:</strong> 06/03/2026</p>
        <p>Make revision cards for key network hardware and explain the concept of protocol layering using the 4-layer TCP/IP model.</p>
        <p class="hw-breakdown" data-due="2026-03-06" style="font-size: 0.85rem; color: #555; font-style: italic;"></p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        <div class="countdown-tag" data-due="2026-03-06">Calculating...</div>
        <div class="weeks-tag" data-due="2026-03-06" style="font-size: 0.9rem; color: #666; font-weight: bold;"></div>
      </div>
    </div>

    <div class="homework-card" style="border-left: 6px solid var(--dark-purple);">
      <div class="homework-info">
        <h4>3.5 Computer networks (Web Services)</h4>
        <p><strong>Due:</strong> 13/03/2026</p>
        <p>Draw a diagram illustrating the roles of DNS, hosting, and the cloud in the process of a user accessing a website.</p>
        <p class="hw-breakdown" data-due="2026-03-13" style="font-size: 0.85rem; color: #555; font-style: italic;"></p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        <div class="countdown-tag" data-due="2026-03-13">Calculating...</div>
        <div class="weeks-tag" data-due="2026-03-13" style="font-size: 0.9rem; color: #666; font-weight: bold;"></div>
      </div>
    </div>

    <div class="homework-card" style="border-left: 6px solid var(--dark-purple);">
      <div class="homework-info">
        <h4>Topic 3.5 Revision</h4>
        <p><strong>Due:</strong> 20/03/2026</p>
        <p>Answer a selection of past exam questions on Topic 3.5: Network types, topologies, hardware, and protocols.</p>
        <p class="hw-breakdown" data-due="2026-03-20" style="font-size: 0.85rem; color: #555; font-style: italic;"></p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        <div class="countdown-tag" data-due="2026-03-20">Calculating...</div>
        <div class="weeks-tag" data-due="2026-03-20" style="font-size: 0.9rem; color: #666; font-weight: bold;"></div>
      </div>
    </div>

    <div class="homework-card" style="margin-bottom: 40px; border-left: 6px solid var(--dark-purple);">
      <div class="homework-info">
        <h4>Topic Consolidation (Units 3.3, 3.4, 3.5)</h4>
        <p><strong>Due:</strong> 27/03/2026</p>
        <p>Complete Seneca Learning quizzes or similar online revision activities covering Data, Systems, and Networks.</p>
        <p class="hw-breakdown" data-due="2026-03-27" style="font-size: 0.85rem; color: #555; font-style: italic;"></p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        <div class="countdown-tag" data-due="2026-03-27">Calculating...</div>
        <div class="weeks-tag" data-due="2026-03-27" style="font-size: 0.9rem; color: #666; font-weight: bold;"></div>
      </div>
    </div>

    <h2>Revision Hub</h2>
    <div class="card-grid">
      <div class="card" onclick="loadContent('resources')" style="cursor: pointer; border-top: 5px solid #007BFF;">
        <div class="card-image" style="background: #007BFF;">📚</div>
        <div class="card-info">
          <h3>Revision Resources</h3>
          <p>Access all activities, external trainers, and revision sites in one place.</p>
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
    <p style="text-align: center; font-size: 1.2rem; color: #555;">Click the card to reveal the definition. Click 'Next' to move to the next term.</p>

    <div class="flashcard-container" style="perspective: 1000px; margin: 40px auto; width: 90%; max-width: 800px; height: 500px; cursor: pointer;" onclick="flipCard()">
      <div id="flashcard" style="position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; box-shadow: 0 15px 30px rgba(0,0,0,0.15);">
        
        <div style="position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; background-color: var(--dark-purple); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 20px;">
          <h2 id="card-term" style="margin: 0; padding: 20px; font-size: 3.5rem;">Algorithm</h2>
          <p style="margin-top: 15px; font-size: 1.2rem; color: #ccc; font-style: italic;">(Click to flip)</p>
        </div>

        <div style="position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; background-color: white; color: #333; transform: rotateY(180deg); display: flex; align-items: center; justify-content: center; border-radius: 20px; border: 4px solid var(--dark-purple);">
          <p id="card-def" style="padding: 40px; font-size: 1.8rem; line-height: 1.6; font-weight: 500;">A set of step-by-step instructions to solve a problem.</p>
        </div>

      </div>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <button onclick="prevCard()" style="padding: 15px 30px; font-size: 1.1rem; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Previous</button>
      <span id="card-counter" style="font-weight: bold; font-size: 1.5rem; margin: 0 20px; vertical-align: middle;">1 / 20</span>
      <button onclick="nextCard()" style="padding: 15px 30px; font-size: 1.1rem; background: var(--dark-purple); color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Next Card</button>
    </div>

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
  <p style="text-align: center; font-size: 1.1rem; color: #555;">Click the card to reveal the definition. Click 'Next' to move to the next term.</p>

  <div class="flashcard-container" style="perspective: 1000px; margin: 40px auto; width: 90%; max-width: 800px; height: 500px; cursor: pointer;" onclick="flipCard()">
    <div id="flashcard" style="position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; box-shadow: 0 15px 30px rgba(0,0,0,0.15); border-radius: 20px;">
      
      <div style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background-color: var(--dark-purple); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 20px;">
        <h2 id="card-term" style="margin: 0; padding: 20px; font-size: 3.5rem;">Term Loading...</h2>
        <p style="margin-top: 15px; font-size: 1.2rem; color: #ccc; font-style: italic;">(Click to flip)</p>
      </div>

      <div style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background-color: white; color: #333; transform: rotateY(180deg); display: flex; align-items: center; justify-content: center; border-radius: 20px; border: 4px solid var(--dark-purple);">
        <p id="card-def" style="padding: 40px; font-size: 1.8rem; line-height: 1.6; font-weight: 500;">Definition Loading...</p>
      </div>
    </div>
  </div>

  <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 30px;">
    <button onclick="prevCard()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Previous</button>
    <span id="card-counter" style="font-weight: bold; font-size: 1.5rem; color: var(--dark-purple);">1 / 32</span>
    <button onclick="nextCard()" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Next Card</button>
  </div>

  <div style="text-align: center; margin-top: 25px;">
    <button onclick="goBack()" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Back to Hub</button>
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
      <h2 class="section-title" style="margin-top: 0;">1. Computational Thinking Techniques</h2>
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
      <h2 class="section-title">2. Representing Algorithms</h2>
      <p>Algorithms are independent of programming languages. We use two main methods to plan them: <strong>Flowcharts</strong> and <strong>Pseudocode</strong>.</p>
      
      <div class="card-grid">
        <div class="card">
          <h3>Flowchart (Find Max)</h3>
          <p>A visual representation using standard shapes to show program logic.</p>
          
          <div style="background: #1e1e1e; padding: 10px; border-radius: 8px; display: flex; justify-content: center; align-items: center; min-height: 420px; border: 1px solid #333;">
            <img src="./basic-symbols-table.jpg" alt="Find Max Flowchart Diagram" style="max-width: 100%; height: auto; border-radius: 4px;">
          </div>
          
          <p style="font-size: 0.8rem; color: #777; margin-top: 10px;"><em>Oval = Start, Rectangle = Process, Diamond = Decision.</em></p>
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
      <h2 class="section-title">3. Searching Algorithms</h2>
      <p>Standard methods for finding specific data within a list.</p>
      <div class="card-grid">
        <div class="card">
          <h3>Linear Search</h3>
          <p>Checks every item one by one from the start until the item is found.</p>
          <ul>
            <li><strong>Prerequisite:</strong> None (list can be unordered).</li>
            <li><strong>Efficiency:</strong> Slow for large lists. In the worst case, it checks every item.</li>
          </ul>
          <button onclick="loadContent('p1_linear_viz')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Visualise</button>
        </div>
        <div class="card">
          <h3>Binary Search</h3>
          <p>A 'Divide and Conquer' algorithm. It checks the middle item; if the target is lower, it discards the top half (and vice-versa), repeatedly halving the list.</p>
          <ul>
            <li><strong>Prerequisite:</strong> The list <strong>MUST</strong> be sorted.</li>
            <li><strong>Efficiency:</strong> Extremely fast for large lists.</li>
          </ul>
          <button onclick="loadContent('p1_binary_viz')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Visualise</button>
        </div>
      </div>
    </div>

    <div class="homework-box">
      <h2 class="section-title">4. Sorting Algorithms</h2>
      <p>Standard methods for organising data into order (e.g., alphabetical or numerical).</p>
      <div class="card-grid">
        <div class="card">
          <h3>Bubble Sort</h3>
          <p>Repeatedly steps through the list, comparing adjacent pairs and swapping them if they are in the wrong order.</p>
          <ul>
            <li><strong>Method:</strong> Uses 'passes'. A pass is one full run through the list.</li>
            <li><strong>Efficiency:</strong> Simple to code but very inefficient (slow) for large datasets.</li>
          </ul>
          <button onclick="loadContent('p1_bubble_viz')" style="padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">Visualise</button>
        </div>
        <div class="card">
          <h3>Merge Sort</h3>
          <p>Another 'Divide and Conquer' algorithm. It splits the list repeatedly into individual items, then merges them back together in the correct order.</p>
          <ul>
            <li><strong>Efficiency:</strong> Much faster and more efficient than Bubble Sort for large lists, but uses more memory.</li>
          </ul>
          <button onclick="loadContent('p1_merge_viz')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Visualise</button>
        </div>
      </div>
    </div>
    
  `,

  p1_linear_viz: `
  <h1>Linear Search Visualisation</h1>
  <p>Linear search iterates through elements sequentially. It works on any array, even if it is not sorted.</p>
  
  <div style="background: #111; padding: 40px 20px; border-radius: 12px; margin: 20px 0; text-align: center; overflow-x: auto;">
    <div id="viz-status" style="color: #fff; font-family: monospace; margin-bottom: 20px; font-size: 1.2rem;">Target: <span id="linear-target-val">--</span></div>
    
    <div id="linear-viz-container" style="display: block; position: relative; height: 100px; width: 850px; margin: 0 auto 30px auto;">
      </div>
    
    <div id="linear-viz-info" style="color: #ccc; font-family: monospace; margin-bottom: 20px; height: 24px;">Click 'Start' to begin</div>
    
    <div style="display: flex; justify-content: center; gap: 10px;">
      <button onclick="startLinearSearch()" id="linear-start-btn" style="padding: 10px 25px; background: var(--accent-green); color: white; border: none; border-radius: 5px; cursor: pointer;">Start Animation</button>
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
    
    <div id="binary-viz-container" style="display: flex; align-items: flex-end; justify-content: center; height: 200px; width: 350px; margin: 0 auto 30px auto; gap: 4px; position: relative;">
      </div>
    
    <div id="viz-step-info" style="color: #ccc; font-family: monospace; margin-bottom: 20px; height: 24px;">Click 'Start' to begin</div>
    
    <div style="display: flex; justify-content: center; gap: 10px;">
      <button onclick="startBinarySearch()" id="binary-start-btn" style="padding: 10px 25px; background: var(--accent-green); color: white; border: none; border-radius: 5px; cursor: pointer;">Start Animation</button>
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
    <div id="viz-container" style="display: flex; align-items: flex-end; position: relative; height: 200px; width: 310px; margin: 0 auto 30px auto;">
      </div>
    <div id="viz-status" style="color: #fff; font-family: monospace; margin-bottom: 20px; height: 20px;">Click 'Start' to begin sorting</div>
    
    <div style="display: flex; justify-content: center; gap: 10px;">
      <button onclick="startBubbleSort()" id="start-btn" style="padding: 10px 25px; background: var(--accent-green); color: white; border: none; border-radius: 5px; cursor: pointer;">Start Animation</button>
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
      <button onclick="startMergeSort()" id="merge-start-btn" style="padding: 10px 25px; background: var(--accent-green); color: white; border: none; border-radius: 5px; cursor: pointer;">Start Animation</button>
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

    <h2 class="section-title">1. Variables and Data Types</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Inputs, Variables & Constants</h3>
        <p><strong>Variables</strong> store data that can change, while <strong>Constants</strong> store data that remains fixed. Using constants prevents accidental changes to important values like PI or tax rates.</p>
        <ul>
          <li><strong>Pros:</strong> Variables make code dynamic and adaptable; constants improve security and readability.</li>
          <li><strong>Cons:</strong> Overusing variables can lead to high memory usage; failing to use constants makes code harder to maintain.</li>
        </ul>
        <button onclick="loadContent('act_io')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try I/O Activity</button>
      </div>
      <div class="card">
        <h3>Data Types & Casting</h3>
        <p>Data types (Integer, Real, Boolean, String) tell the computer how much memory to allocate. <strong>Casting</strong> is essential for converting user input (always a string) into numbers for calculations.</p>
        <ul>
          <li><strong>Pros:</strong> Casting allows mathematical operations on text-based inputs.</li>
          <li><strong>Cons:</strong> Incorrect casting (e.g., trying to turn "Hello" into an Int) will crash the program with a Type Error.</li>
        </ul>
        <button onclick="loadContent('act_casting')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Casting Activity</button>
      </div>
    </div>

    <h2 class="section-title">2. Programming Constructs</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Selection (If-Else)</h3>
        <p>Selection allows a program to take different paths based on conditions. This is used to create logic, such as checking if a password is correct or a player has enough health.</p>
        <ul>
          <li><strong>Pros:</strong> Essential for making code "smart" and reactive to user choices.</li>
          <li><strong>Cons:</strong> Deeply nested "If" statements (Spaghetti Code) become extremely difficult to read and debug.</li>
        </ul>
        <button onclick="loadContent('act_selection')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Selection Activity</button>
      </div>
      <div class="card">
        <h3>Iteration (Loops)</h3>
        <p>Iteration repeats code. <strong>FOR loops</strong> are used when you know the number of repeats; <strong>WHILE loops</strong> are used when the repeats depend on a condition (like waiting for a correct password).</p>
        <ul>
          <li><strong>Pros:</strong> Dramatically reduces the number of lines of code; makes code more efficient.</li>
          <li><strong>Cons:</strong> Infinite loops (where the exit condition is never met) will cause the program to hang or crash.</li>
        </ul>
        <button onclick="loadContent('act_loops')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Loops Activity</button>
      </div>
    </div>

    <h2 class="section-title">3. Data Handling</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Lists (Arrays)</h3>
        <p>Lists allow you to store multiple pieces of related data (e.g., a high-score list) under one name. This is much more efficient than creating 100 separate variables.</p>
        <ul>
          <li><strong>Pros:</strong> Makes managing large datasets easier using loops and indexing.</li>
          <li><strong>Cons:</strong> In many languages, arrays are fixed in size; accessing an index that doesn't exist causes an "Out of Bounds" error.</li>
        </ul>
        <button onclick="loadContent('act_lists')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Lists Activity</button>
      </div>
      <div class="card">
        <h3>String Manipulation</h3>
        <p>Used to format data for the user. Methods like <code>.upper()</code> or <code>.lower()</code> are vital for making user inputs case-insensitive during login checks.</p>
        <ul>
          <li><strong>Pros:</strong> Allows for powerful data cleaning and user-friendly display.</li>
          <li><strong>Cons:</strong> Strings are often immutable (cannot be changed), meaning every manipulation creates a new copy in memory.</li>
        </ul>
        <button onclick="loadContent('act_strings')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Strings Activity</button>
      </div>
    </div>

    <h2 class="section-title">4. Modularity and Robustness</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Defensive Design</h3>
        <p>Involves <strong>Validation</strong> (checking if data follows rules) and <strong>Authentication</strong>. It is used to protect programs from malicious users and accidental typos.</p>
        <ul>
          <li><strong>Pros:</strong> Prevents program crashes and ensures only "clean" data enters the system.</li>
          <li><strong>Cons:</strong> Over-validating can make the user experience feel slow or frustrating.</li>
        </ul>
        <button onclick="loadContent('act_robust')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Robustness Activity</button>
      </div>
      <div class="card">
        <h3>Subroutines (Functions)</h3>
        <p>Subroutines are blocks of code that perform a specific task. They are used to make code <strong>modular</strong> and <strong>reusable</strong> across different projects.</p>
        <ul>
          <li><strong>Pros:</strong> Code only needs to be written once; makes debugging easier as errors are isolated to specific functions.</li>
          <li><strong>Cons:</strong> Passing too many parameters between functions can make the program logic confusing to follow.</li>
        </ul>
        <button onclick="loadContent('act_subroutines')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Subroutines Activity</button>
      </div>
    </div>

  `,

  act_io: `
    <h1>Activity: Inputs & Outputs</h1>
      <div class="homework-box">
        <h3>Task: The Level Reporter</h3>
        <p>Write a program that asks for your current level in all of your subjects, stores them in different, suitably named variables, and displays them in an organised, well-presented report on the screen.</p>
        
        <div style="margin: 20px 0; border: 2px solid var(--dark-purple); border-radius: 12px; overflow: hidden; background: #f9f9f9;">
          <div style="background: var(--dark-purple); color: white; padding: 10px; font-size: 0.9rem; font-weight: bold;">
            Python 3 Interactive Console
          </div>
          <iframe src="https://trinket.io/embed/python/3d8d7ce66b" width="100%" height="450" frameborder="0" allowfullscreen></iframe>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button onclick="document.getElementById('io-hint').style.display='block'" style="padding: 10px; background: #FFC107; color: #333; border: none; border-radius: 5px; cursor: pointer;">Give a Hint</button>
          <button onclick="document.getElementById('io-answer').style.display='block'" style="padding: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Show Answer</button>
        </div>

        <div id="io-hint" style="display: none; background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 5px solid #ffc107; margin-bottom: 20px; color: #856404;">
          <strong>Hint:</strong> Start by creating variables like <code>maths_level = input("Enter Maths level: ")</code>. You will need one input line for each subject.
        </div>

        <div id="io-answer" style="display: none; background: #f4f4f4; padding: 15px; border-radius: 8px; border: 1px solid #ddd; font-family: monospace; white-space: pre; margin-bottom: 20px;">
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
          <button onclick="document.getElementById('cast-hint').style.display='block'" style="padding: 10px; background: #FFC107; color: #333; border: none; border-radius: 5px; cursor: pointer;">Show Hint</button>
          <button onclick="document.getElementById('cast-answer').style.display='block'" style="padding: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Show Answer</button>
        </div>

        <div id="cast-hint" style="display: none; background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeeba; margin-bottom: 20px; color: #856404;">
          <strong>Hint:</strong> Python treats inputs as text (strings). You must use <code>float()</code> to convert the input into a decimal number before you can multiply it.
        </div>

        <div id="cast-answer" style="display: none; background: #f4f4f4; padding: 15px; border-radius: 8px; border: 1px solid #ddd; font-family: monospace; white-space: pre; margin-bottom: 20px;">
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
          <div style="background: var(--dark-purple); color: white; padding: 10px; font-size: 0.9rem; font-weight: bold;">
            Python 3 Interactive Console
          </div>
          <iframe src="https://trinket.io/embed/python/3d8d7ce66b" width="100%" height="450" frameborder="0" allowfullscreen></iframe>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button onclick="document.getElementById('sel-hint').style.display='block'" style="padding: 10px; background: #FFC107; color: #333; border: none; border-radius: 5px; cursor: pointer;">Give a Hint</button>
          <button onclick="document.getElementById('selection-answer').style.display='block'" style="padding: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Show Answer</button>
        </div>

        <div id="sel-hint" style="display: none; background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 5px solid #ffc107; margin-bottom: 20px; color: #856404;">
          <strong>Hint:</strong> Use <code>int(input())</code> to make sure the number is treated as an integer. Then use <code>if num == 1:</code> for your first condition.
        </div>

        <div id="selection-answer" style="display: none; background: #f4f4f4; padding: 15px; border-radius: 8px; border: 1px solid #ddd; font-family: monospace; white-space: pre; margin-bottom: 20px;">
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
          <button onclick="document.getElementById('robust-hint').style.display='block'" style="padding: 10px; background: #FFC107; color: #333; border: none; border-radius: 5px; cursor: pointer;">Give a Hint</button>
          <button onclick="document.getElementById('robust-answer').style.display='block'" style="padding: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Show Answer</button>
        </div>

        <div id="robust-hint" style="display: none; background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 5px solid #ffc107; margin-bottom: 20px; color: #856404;">
          <strong>Hint:</strong> Use a <code>while</code> loop that checks <code>len(password)</code>. The loop should keep running as long as the length is less than 6 OR greater than 12.
        </div>

        <div id="robust-answer" style="display: none; background: #f4f4f4; padding: 15px; border-radius: 8px; border: 1px solid #ddd; font-family: monospace; white-space: pre; margin-bottom: 20px;">
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
          <button onclick="document.getElementById('loop-hint').style.display='block'" style="padding: 10px; background: #FFC107; color: #333; border: none; border-radius: 5px; cursor: pointer;">Give a Hint</button>
          <button onclick="document.getElementById('loop-answer').style.display='block'" style="padding: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Show Answer</button>
        </div>

        <div id="loop-hint" style="display: none; background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 5px solid #ffc107; margin-bottom: 20px; color: #856404;">
          <strong>Hint:</strong> Use a <code>for</code> loop with <code>range(1, 13)</code>. Inside the loop, calculate the square by multiplying the loop variable by itself.
        </div>

        <div id="loop-answer" style="display: none; background: #f4f4f4; padding: 15px; border-radius: 8px; border: 1px solid #ddd; font-family: monospace; white-space: pre; margin-bottom: 20px;">
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
          <button onclick="document.getElementById('list-hint').style.display='block'" style="padding: 10px; background: #FFC107; color: #333; border: none; border-radius: 5px; cursor: pointer;">Show Hint</button>
          <button onclick="document.getElementById('list-answer').style.display='block'" style="padding: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Show Answer</button>
        </div>

        <div id="list-hint" style="display: none; background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeeba; margin-bottom: 20px; color: #856404;">
          <strong>Hint:</strong> When looping through a 2D list, each "item" in the loop is a sub-list. Access the name by using index <code>[0]</code> of that sub-list.
        </div>

        <div id="list-answer" style="display: none; background: #f4f4f4; padding: 15px; border-radius: 8px; border: 1px solid #ddd; font-family: monospace; white-space: pre; margin-bottom: 20px;">
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
          <button onclick="document.getElementById('sub-hint').style.display='block'" style="padding: 10px; background: #FFC107; color: #333; border: none; border-radius: 5px; cursor: pointer;">Give a Hint</button>
          <button onclick="document.getElementById('sub-answer').style.display='block'" style="padding: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Show Answer</button>
        </div>

        <div id="sub-hint" style="display: none; background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 5px solid #ffc107; margin-bottom: 20px; color: #856404;">
          <strong>Hint:</strong> Define your function using <code>def calculate_age(current):</code>. Use the <code>return</code> keyword to send the result back to your main program.
        </div>

        <div id="sub-answer" style="display: none; background: #f4f4f4; padding: 15px; border-radius: 8px; border: 1px solid #ddd; font-family: monospace; white-space: pre; margin-bottom: 20px;">
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
          <button onclick="document.getElementById('str-hint').style.display='block'" style="padding: 10px; background: #FFC107; color: #333; border: none; border-radius: 5px; cursor: pointer;">Show Hint</button>
          <button onclick="document.getElementById('str-answer').style.display='block'" style="padding: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Show Answer</button>
        </div>

        <div id="str-hint" style="display: none; background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeeba; margin-bottom: 20px; color: #856404;">
          <strong>Hint:</strong> Use the <code>.lower()</code> method. Example: <code>print(my_string.lower())</code>.
        </div>

        <div id="str-answer" style="display: none; background: #f4f4f4; padding: 15px; border-radius: 8px; border: 1px solid #ddd; font-family: monospace; white-space: pre; margin-bottom: 20px;">
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
    
    <h2 class="section-title">1. Units of Information</h2>
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
        <h3>Number Systems</h3>
        <p><strong>Binary (Base 2):</strong> Uses 0 and 1. Essential as computers physically cannot represent more than two states.</p>
        <p><strong>Hexadecimal (Base 16):</strong> Uses 0-9 and A-F. Used by computer scientists to simplify long binary strings into a shorter, more readable format.</p>
      </div>
    </div>

    <h2 class="section-title">2. Conversion Guide</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Denary to Binary</h3>
        <p>Subtract the largest possible power of two from your number, placing a '1' in that column and a '0' if the value is too large.</p>
        <div style="font-family: monospace; font-size: 0.9rem; margin-bottom: 10px;">Example: Convert 105</div>
        <table style="width:100%; border-collapse: collapse; text-align: center; font-family: monospace; margin-bottom: 15px; background: #f8f9fa; border: 1px solid #dee2e6;">
          <tr style="background: #e9ecef; color: var(--dark-purple); font-weight: bold;">
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
        <p style="font-size: 0.85rem; background: #fff3cd; padding: 10px; border-radius: 5px;">
          105 - 64 = 41<br>
          41 - 32 = 9<br>
          9 - 8 = 1<br>
          1 - 1 = 0
        </p>
      </div>

      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Binary to Denary</h3>
        <p>Place your binary digits into a power-of-two table and add the values where a '1' appears.</p>
        <table style="width:100%; border-collapse: collapse; text-align: center; font-family: monospace; margin: 15px 0; background: #f8f9fa; border: 1px solid #dee2e6;">
          <tr style="background: #e9ecef; color: var(--dark-purple); font-weight: bold;">
            <td style="padding: 8px; border: 1px solid #dee2e6;">128</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">64</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">32</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">16</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">8</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">4</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">2</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">1</td>
          </tr>
          <tr style="font-size: 1.4rem; color: #333;">
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
        <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; font-family: 'Courier New', monospace;">
          <strong>Calculation:</strong><br>
          128 + 32 + 8 = 168
        </div>
      </div>

      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Binary to Hex</h3>
        <p>Split the byte into two nibbles (4 bits each).</p>
        <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 0.9rem;">
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
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; font-family: monospace;">
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
        <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 0.9rem;">
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
        <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; font-family: 'Courier New', monospace;">
          Example: <strong>2C</strong><br><br>
          1. Left (2): 2 x 16 = 32<br>
          2. Right (C): 12<br>
          3. 32 + 12 = 44<br><br>
          Result: <strong>44</strong>
        </div>
      </div>
    </div>

    <h2 class="section-title">3. Characters and Text</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>ASCII</h3>
        <p>The American Standard Code for Information Interchange.</p>
        <ul>
          <li><strong>Standard ASCII:</strong> Uses 7 bits to represent 127 characters.</li>
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

    <h2 class="section-title">4. Images and Sound</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Bitmap Images</h3>
        <p>Images made of rows of dots called <strong>pixels</strong>.</p>
        <ul>
          <li><strong>Resolution:</strong> The number of pixels in a space (e.g., DPI). Higher resolution means more detail but larger file size.</li>
          <li><strong>Colour Depth:</strong> The number of bits per pixel. More bits allow for a greater range of colours, making images look more real.</li>
        </ul>
      </div>
      <div class="card">
        <h3>Digital Sound</h3>
        <p>Sound is digitised by <strong>sampling</strong> the amplitude of analogue waves at set intervals.</p>
        <ul>
          <li><strong>Sample Rate:</strong> Number of samples per second (Hz). Higher rates reduce gaps between recordings.</li>
          <li><strong>Bit Depth:</strong> Number of bits used per sample. Higher bit depth improves quality by recording more data per sample.</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title">5. Data Representation Calculations</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid #007bff;">
        <h3>Image File Size Calculation</h3>
        <p>The total number of bits in an image is calculated by multiplying dimensions by the colour depth.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6; font-family: monospace;">
          <strong>Example:</strong> A 100 x 100 pixel image with a 8-bit colour depth.<br><br>
          1. <strong>Total Pixels:</strong> 100 x 100 = 10,000 pixels<br>
          2. <strong>Total Bits:</strong> 10,000 x 8 = 80,000 bits<br>
          3. <strong>In Bytes:</strong> 80,000 / 8 = 10,000 bytes<br><br>
          <strong>Formula:</strong> Width x Height x Colour Depth
        </div>
      </div>

      <div class="card" style="border-top: 5px solid #28a745;">
        <h3>Sound File Size Calculation</h3>
        <p>Calculated by multiplying the sample rate, bit depth, and duration in seconds.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6; font-family: monospace;">
          <strong>Example:</strong> 10s of audio, 44,100Hz sample rate, 16-bit depth.<br><br>
          1. <strong>Calculation:</strong> 44,100 x 16 x 10<br>
          2. <strong>Total Bits:</strong> 7,056,000 bits<br>
          3. <strong>In MB:</strong> approx 0.88 MB<br><br>
          <strong>Formula:</strong> Rate x Depth x Time
        </div>
      </div>
    </div>

    <h2 class="section-title">6. Compression File Types</h2>
    <div class="homework-box">
      <p>Different file formats are designed for specific tasks. Lossy is best for streaming and web use, while Lossless is essential for documents where every bit must be preserved.</p>
      <table style="width:100%; border-collapse: collapse; margin-top: 20px; color: white; background: #222; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: var(--dark-purple); text-align: left;">
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
        <button onclick="loadContent('p2_rle_act')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try RLE Activity</button>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Huffman Encoding</h3>
        <p>Uses a frequency-based tree to assign shorter binary codes to more frequent characters, reducing the overall file size.</p>
        <button onclick="loadContent('p2_huffman_act')" style="margin-top: 10px; padding: 8px 15px; background: var(--accent-green); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Huffman Activity</button>
      </div>
    </div>

  `,

  p2_rle_act: `
    <h1>RLE Compression Activity</h1>
    <p>Enter a string with repeated characters (e.g., "AAAABBBCC") to see how RLE compresses it.</p>
    
    <div style="background: #111; padding: 40px; border-radius: 12px; margin: 20px 0; text-align: center;">
      <input type="text" id="rle-input" placeholder="Enter text here..." style="padding: 10px; width: 80%; border-radius: 5px; border: none; margin-bottom: 20px;">
      <div id="rle-result" style="color: #fff; font-family: monospace; font-size: 1.5rem; min-height: 40px;"></div>
      <button onclick="runRLE()" style="margin-top: 20px; padding: 10px 25px; background: var(--accent-green); color: white; border: none; border-radius: 5px; cursor: pointer;">Compress Now</button>
    </div>

    <div class="homework-box">
      <h3>Exam Tip</h3>
      <p>RLE works best on data with long runs of repeated values, like simple icons or indented code.</p>
    </div>
  `,

  p2_huffman_act: `
  <h1>Full Huffman Tree Challenge</h1>
  <p>Build the tree for <strong>"BANNED"</strong>. Frequencies: <strong>N:2, B:1, A:1, E:1, D:1</strong>. Total = 6.</p>
  
  <div style="background: #111; padding: 40px; border-radius: 12px; margin: 20px 0; text-align: center; color: white; overflow-x: auto;">
    <div class="tree-wrapper" style="position: relative; width: 800px; margin: 0 auto; height: 550px;">
      
      <div style="position: absolute; left: 375px; top: 0; z-index: 2;">
        <input type="text" id="node-sum-6" placeholder="Sum" style="width: 55px; height: 55px; text-align: center; border-radius: 50%; background: #222; color: white; border: 2px solid #888;">
      </div>

      <div style="position: absolute; left: 150px; top: 120px; z-index: 2;">
        <div style="width: 55px; height: 55px; background: var(--accent-green); border-radius: 8px; line-height: 55px; font-weight: bold;">N</div>
      </div>
      <div style="position: absolute; left: 600px; top: 120px; z-index: 2;">
        <input type="text" id="node-sum-4" placeholder="Sum" style="width: 55px; height: 55px; text-align: center; border-radius: 50%; background: #222; color: white; border: 2px solid #888;">
      </div>

      <div style="position: absolute; left: 450px; top: 220px; z-index: 2;">
         <input type="text" id="node-letter-B" placeholder="Ltr" style="width: 50px; height: 50px; text-align: center; background: #444; color: white; border-radius: 4px; border: 1px solid #888;">
      </div>
      <div style="position: absolute; left: 700px; top: 220px; z-index: 2;">
        <input type="text" id="node-sum-3" placeholder="Sum" style="width: 55px; height: 55px; text-align: center; border-radius: 50%; background: #222; color: white; border: 2px solid #888;">
      </div>

      <div style="position: absolute; left: 600px; top: 320px; z-index: 2;">
        <input type="text" id="node-letter-A" placeholder="Ltr" style="width: 50px; height: 50px; text-align: center; background: #444; color: white; border-radius: 4px; border: 1px solid #888;">
      </div>
      <div style="position: absolute; left: 750px; top: 320px; z-index: 2;">
        <input type="text" id="node-sum-2" placeholder="Sum" style="width: 55px; height: 55px; text-align: center; border-radius: 50%; background: #222; color: white; border: 2px solid #888;">
      </div>

      <div style="position: absolute; left: 700px; top: 420px; z-index: 2;">
        <input type="text" id="node-letter-E" placeholder="Ltr" style="width: 50px; height: 50px; text-align: center; background: #444; color: white; border-radius: 4px; border: 1px solid #888;">
      </div>
      <div style="position: absolute; left: 800px; top: 420px; z-index: 2;">
        <input type="text" id="node-letter-D" placeholder="Ltr" style="width: 50px; height: 50px; text-align: center; background: #444; color: white; border-radius: 4px; border: 1px solid #888;">
      </div>

      <svg style="position: absolute; top: 0; left: 0; width: 900px; height: 100%; pointer-events: none;">
        <line x1="402" y1="55" x2="177" y2="120" stroke="#666" stroke-width="2" /> <line x1="402" y1="55" x2="627" y2="120" stroke="#666" stroke-width="2" /> <line x1="627" y1="175" x2="475" y2="220" stroke="#666" stroke-width="2" /> <line x1="627" y1="175" x2="727" y2="220" stroke="#666" stroke-width="2" /> <line x1="727" y1="275" x2="625" y2="320" stroke="#666" stroke-width="2" /> <line x1="727" y1="275" x2="777" y2="320" stroke="#666" stroke-width="2" /> <line x1="777" y1="375" x2="725" y2="420" stroke="#666" stroke-width="2" /> <line x1="777" y1="375" x2="825" y2="420" stroke="#666" stroke-width="2" /> </svg>
    </div>

    <div id="huff-feedback" style="margin-top: 40px; min-height: 24px; font-weight: bold;"></div>
    
    <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
      <button onclick="checkFullHuffman()" style="padding: 12px 30px; background: var(--accent-green); color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Verify Tree Logic</button>
      <button onclick="loadContent('p2_huffman_act')" style="padding: 12px 30px; background: #444; color: white; border: none; border-radius: 5px; cursor: pointer;">Reset Tree</button>
    </div>
  </div>
  
`,

  // --- 3.4 SYSTEMS (Updated Dynamic Layout) ---
  p2_sys: `
    <h1>3.4 Computer Systems</h1>
    <p>This unit covers how hardware components work together and the essential software that manages them.</p>

    <h2 class="section-title">1. Architecture & The CPU</h2>
    <div class="card-grid" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">
      
      <div class="card" style="flex: 1 1 100%; border: 2px solid var(--dark-purple); min-height: auto;">
        <h3 style="text-align: center;">Von Neumann Architecture</h3>
        <div style="background: white; padding: 10px; border-radius: 8px; text-align: center;">
          <img src="./Von-Neumann-Architecture-Diagram.jpg" alt="Von Neumann CPU Diagram" style="max-width: 100%; height: auto; border-radius: 5px;">
          <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">The Operating System sits between applications and the hardware, enabling them to communicate.</p>
        </div>
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

    <div class="homework-box" style="margin-top: 50px;">
      <h2 class="section-title">The Fetch-Decode-Execute Cycle</h2>
      <p>The continuous process a CPU follows to process instructions:</p>
      <ol>
        <li><strong>Fetch:</strong> The instruction is retrieved from memory (RAM) to the CPU.</li>
        <li><strong>Decode:</strong> The Control Unit (CU) works out what the instruction is.</li>
        <li><strong>Execute:</strong> The instruction is carried out by the ALU or other components.</li>
      </ol>
    </div>

    <h2 class="section-title">2. Programming Languages</h2>
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
      <table style="width:100%; border-collapse: collapse; margin-top: 10px; background: white; border: 1px solid #ddd;">
        <tr style="background: #f8f9fa; font-weight: bold;">
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

    <h2 class="section-title">3. Translators</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--accent-green); flex: 1 1 100%;">
        <h3>How Code is Converted</h3>
        <p>Computers can only execute **Machine Code** (binary). Translators convert source code into this executable format.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 15px;">
          <div style="background: #f1f1f1; padding: 15px; border-radius: 8px;">
            <h4>Compiler</h4>
            <p>Translates the <strong>entire</strong> source code at once into an executable file.</p>
            <ul>
              <li><strong>Execution:</strong> Very fast as translation is already done.</li>
              <li><strong>Security:</strong> Source code is hidden from the user.</li>
              <li><strong>Error Handling:</strong> Reports all errors only after trying to compile the whole program.</li>
            </ul>
          </div>
          
          <div style="background: #f1f1f1; padding: 15px; border-radius: 8px;">
            <h4>Interpreter</h4>
            <p>Translates and executes code <strong>line-by-line</strong>.</p>
            <ul>
              <li><strong>Execution:</strong> Slower because translation happens while the program runs.</li>
              <li><strong>Debugging:</strong> Program stops at the first error, making it easy to find.</li>
              <li><strong>Environment:</strong> Requires the interpreter software to be installed on the target machine.</li>
            </ul>
          </div>

          <div style="background: #f1f1f1; padding: 15px; border-radius: 8px;">
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

    <h2 class="section-title" style="margin-top: 40px;">Translator Matching Game</h2>
    <p>Drag the language or feature to the correct translator.</p>
    
    <div class="homework-box">
      <div id="role-bank" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; padding: 15px; background: #eee; border-radius: 8px; min-height: 50px;">
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

  `,

  // --- 3.5 COMPUTER NETWORKS (Updated with Workbook Data) ---
  p2_net: `
    <h1>3.5 Computer Networks</h1>
    <p>A computer network is defined as two or more computers connected together to share information and resources.</p>

    <h2 class="section-title">1. Network Types & Topologies</h2>
    <div class="card-grid" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">
      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <h3>Types of Network</h3>
        <ul style="flex-grow: 1;">
          <li><strong>PAN (Personal Area Network):</strong> Covers a very short range (few metres) for personal devices like Bluetooth headphones.</li>
          <li><strong>LAN (Local Area Network):</strong> Covers a small geographical area. Infrastructure is typically organisation-owned.</li>
          <li><strong>WAN (Wide Area Network):</strong> Covers a large or worldwide area using 3rd party infrastructure like satellites.</li>
        </ul>
      </div>

      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <h3>Network Topologies</h3>
        <p>Devices on a network are known as <strong>nodes</strong>.</p>
        <ul style="flex-grow: 1;">
          <li><strong>Star:</strong> All nodes connect to a central switch. Easy to add devices but relies on the central node.</li>
          <li><strong>Bus:</strong> All nodes connect to a single backbone cable. Cheap to install but a cable break ruins the whole network.</li>
          <li><strong>Ring:</strong> Each node connects to two others, forming a loop. Data travels in one direction, preventing collisions.</li>
          <li><strong>Mesh:</strong> Every node is connected to every other node. Extremely reliable and "self-healing," as there is no single point of failure.</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title">2. Protocols & Addressing</h2>
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
          <li><strong>UDP:</strong> A faster, "connectionless" alternative to TCP used for live streaming/gaming where speed is prioritized over reliability.</li>
        </ul>

        <h4 style="margin: 10px 0 5px 0; color: var(--dark-purple);">Web & File Transfer</h4>
        <ul style="margin-bottom: 10px;">
          <li><strong>HTTP/HTTPS:</strong> Rules for web browsers to access websites; HTTPS uses encryption for security.</li>
          <li><strong>FTP:</strong> Used specifically for transferring files over a network.</li>
        </ul>

        <h4 style="margin: 10px 0 5px 0; color: var(--dark-purple);">Email Protocols</h4>
        <ul style="flex-grow: 1;">
          <li><strong>SMTP:</strong> Used to <strong>send</strong> emails to a server.</li>
          <li><strong>IMAP:</strong> Used to <strong>retrieve</strong> and manage emails on a server (syncs across devices).</li>
          <li><strong>POP:</strong> Used to <strong>download</strong> emails from a server to a single device (deletes them from server).</li>
        </ul>
      </div>
    </div>

    <h2 class="section-title">3. TCP/IP Layer Stack</h2>
    <div class="card-grid" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">
      <div class="card" style="flex: 1 1 100%; border-top: 5px solid var(--dark-purple);">
        <h3>The 4-Layer Model</h3>
        <p>Networking protocols are organised into layers to ensure compatibility and simplify complex communication.</p>
        
        <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
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
      <div id="role-bank" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; padding: 15px; background: #eee; border-radius: 8px; min-height: 50px;">
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-http" data-phase="app">HTTP</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-https" data-phase="app">HTTPS</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-ftp" data-phase="app">FTP</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-smtp" data-phase="app">SMTP</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-imap" data-phase="app">IMAP</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-tcp" data-phase="trans">TCP</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-udp" data-phase="trans">UDP</div>
        <div class="draggable-role" draggable="true" ondragstart="drag(event)" id="proto-ip" data-phase="net">IP</div>
      </div>

      <div class="card-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" id="app">
          <h3>Application Layer</h3>
          <p style="font-size:0.8rem; color:#666;">Web browsers, Email clients</p>
        </div>
        <div class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" id="trans">
          <h3>Transport Layer</h3>
          <p style="font-size:0.8rem; color:#666;">Splitting data into packets</p>
        </div>
        <div class="drop-zone" ondrop="drop(event)" ondragover="allowDrop(event)" id="net">
          <h3>Internet Layer</h3>
          <p style="font-size:0.8rem; color:#666;">Addressing & Routing</p>
        </div>
      </div>
      
      <div id="game-feedback" style="margin-top: 20px; font-weight: bold; min-height: 24px; text-align: center;"></div>
      
      <div style="display:flex; justify-content: center; gap: 10px; margin-top: 20px;">
        <button onclick="loadContent('p2_net')" style="padding: 10px 20px; background: var(--pastel-violet); color: var(--dark-purple); font-weight: bold; border: none; border-radius: 5px; cursor: pointer;">Reset Game</button>
      </div>
    </div>
  `,

  // --- 3.6 CYBER SECURITY (Updated with Workbook Data) ---
  p2_cyber: `
    <h1>3.6 Cyber Security</h1>
    <p>Cyber security consists of the processes, practices, and technologies designed to protect networks, computers, programs, and data from attack, damage, or unauthorised access.</p>

    <h2 class="section-title">1. Threats and Attack Methods</h2>
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

    <button onclick="loadContent('p2_threat_viz')" style="margin-top: 20px; margin-left:15px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Visualise</button>
    <button onclick="loadContent('p2_phish_game')" style="margin-top: 10px; padding: 10px 20px; background: var(--accent-green); color: white; border: none; border-radius: 5px; cursor: pointer;">Play Spot the Phish</button>
    
    <h2 class="section-title">2. Other Attack Types</h2>
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

    <button onclick="loadContent('p2_attack_viz')" style="margin-top: 20px; margin-left:15px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Visualise</button>
    
    <h2 class="section-title">3. Cyber Security Protection</h2>
    <div class="card-grid" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: stretch;">
      <div class="card" style="flex: 1 1 100%; border-top: 5px solid var(--accent-green);">
        <h3>Defensive Methods</h3>
        <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 10px;">
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
      <div id="viz-stage-title" style="font-size: 1.5rem; color: var(--accent-green); margin-bottom: 10px;">Select a Threat Below</div>
      
      <div id="viz-graphic-container" style="display: flex; justify-content: space-around; align-items: center; margin: 30px 0; font-size: 3rem;">
        <div id="viz-source" style="opacity: 0.3;">🏠</div>
        <div id="viz-path" style="font-size: 1.5rem; color: #555;">---------</div>
        <div id="viz-target" style="opacity: 0.3;">💻</div>
      </div>

      <div id="viz-explanation" style="background: #222; padding: 20px; border-radius: 8px; font-family: monospace; line-height: 1.6;">
        Click a button to see the step-by-step logic of the attack.
      </div>

      <div style="display: flex; justify-content: center; gap: 10px; margin-top: 30px;">
        <button onclick="runThreatLogic('virus')" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">Virus</button>
        <button onclick="runThreatLogic('worm')" style="padding: 10px 20px; background: #fd7e14; color: white; border: none; border-radius: 5px; cursor: pointer;">Worm</button>
        <button onclick="runThreatLogic('trojan')" style="padding: 10px 20px; background: #6f42c1; color: white; border: none; border-radius: 5px; cursor: pointer;">Trojan</button>
        <button onclick="runThreatLogic('phishing')" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Phishing</button>
      </div>
    </div>

    <button onclick="loadContent('p2_cyber')" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Back to Threats</button>
  `,

  p2_phish_game: `
  <h1>Spot the Phish Challenge</h1>
  <p>Social engineering involves manipulating people into giving up confidential information. Can you find the 4 red flags in this email?</p>
  
  <div style="background: white; color: #333; padding: 20px; border-radius: 8px; max-width: 600px; margin: 20px auto; border: 1px solid #ccc; text-align: left; font-family: Arial, sans-serif;">
    <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
      <strong>From:</strong> <span class="phish-target" onclick="revealPhish(this, 'Spoofed Email: It says \\'Security\\', but the actual address is \\'noreply@hack-net.com\\'')">Security Center &lt;account-verify@security-bank-web.net&gt;</span><br>
      <strong>Subject:</strong> <span class="phish-target" onclick="revealPhish(this, 'Urgency: Using alarming language like \\'Immediate Action\\' is a common tactic')">URGENT: Immediate Action Required - Account Suspended</span>
    </div>
    
    <p class="phish-target" onclick="revealPhish(this, 'Generic Greeting: Real banks usually use your actual name, not \\'Dear Customer\\'')">Dear Valued Customer,</p>
    
    <p>We have detected suspicious activity on your account. To prevent unauthorized access, we have temporarily suspended your banking privileges.</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <span class="phish-target" onclick="revealPhish(this, 'Suspicious Link: Hovering would show it leads to a non-bank website')" style="background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer; display: inline-block;">Verify Account Identity Now</span>
    </div>
    
    <p>If you do not complete this verification within 24 hours, your account will be permanently closed.</p>
    <p>Thank you,<br>The Security Team</p>
  </div>

  <div id="phish-feedback" style="min-height: 40px; color: var(--accent-green); font-weight: bold; margin: 20px 0;">Found: 0 / 4 Red Flags</div>
  
  <button onclick="loadContent('p2_cyber')" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Back to Security</button>

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
        <div style="font-size: 3rem;">🖥️</div>
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

    <button onclick="loadContent('p2_cyber')" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Back to Security</button>
  `,

  // --- 3.7 DATABASES (Merged & Finalised) ---
  p2_sql: `
    <h1>3.7 Relational Databases (SQL)</h1>
    <p>A database is a <strong>persistent, organised store of related data</strong>. Persistent means the data is permanent and remains stored even after the computer is turned off.</p>

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

    

    <h2 class="section-title">Structured Query Language (SQL)</h2>
    <p>SQL is the standard language used to create, update, delete, and query (search) databases.</p>

    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Creating & Inserting</h3>
        <p><strong>CREATE TABLE:</strong> Sets up a new table with specific fields and data types.</p>
        <code style="display:block; background:#eee; padding:10px; border-radius:5px; font-family:monospace; color:#333;">CREATE TABLE Students<br>(student_ID text, first_name text, surname text, age number)</code>
        
        <p><strong>INSERT INTO:</strong> Adds a new record to a table.</p>
        <code style="display:block; background:#eee; padding:10px; border-radius:5px; font-family:monospace; color:#333;">INSERT INTO students<br>VALUES ('009', 'Jim', 'Smith', '9AB', '14')</code>
      </div>

      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Querying & Modifying</h3>
        <p><strong>SELECT:</strong> Used to retrieve specific data. Use * as a wildcard for "all".</p>
        <code style="display:block; background:#eee; padding:10px; border-radius:5px; font-family:monospace; color:#333;">SELECT first_name, surname FROM students<br>WHERE group = '9AB' ORDER BY surname DESC</code>

        <p><strong>UPDATE:</strong> Alters existing data in the database.</p>
        <code style="display:block; background:#eee; padding:10px; border-radius:5px; font-family:monospace; color:#333;">UPDATE students SET surname = 'Hickman'<br>WHERE first_name = 'Sam'</code>
      </div>
    </div>

    <div class="homework-box">
      <h3>DBMS Capabilities</h3>
      <p>A Database Management System (DBMS) is the software used to manage data. It must be able to: <strong>Create, Add, Delete, Edit,</strong> and <strong>Search</strong> for data.</p>
    </div>

  `,

  // --- 3.8 IMPACTS OF TECH (Updated with Workbook Data) ---
  p2_impact: `
    <h1>3.8 Impacts of Digital Technology</h1>
    <p>As technology develops, it creates a range of issues that can be categorised as ethical, legal, cultural, environmental, and privacy-related. To understand these, we must look at them through the eyes of <strong>stakeholders</strong>—individuals or groups affected by an issue.</p>

    <h2 class="section-title">1. Ethical, Cultural & Social Issues</h2>
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

    <h2 class="section-title">2. Environmental Impacts</h2>
    <div class="homework-box">
      <p>Technology impacts the environment in three main ways:</p>
      <ul>
        <li><strong>Energy Consumption:</strong> Devices and data centres require vast amounts of electricity, often produced by burning fossil fuels.</li>
        <li><strong>Manufacturing:</strong> Creating components produces waste products and uses precious raw materials.</li>
        <li><strong>E-Waste:</strong> Rapid development means devices become obsolete quickly. Mobile devices often end up in landfills, where batteries leak harmful chemicals.</li>
      </ul>
    </div>

    <h2 class="section-title">3. Legislation (The Law)</h2>
    <p>There are five major laws governing computer use in the UK that you must know:</p>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Data Protection Act (1998)</h3>
        <p>Controls how personal data is used by organisations. Data must be used fairly, kept secure, and not kept for longer than necessary.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Computer Misuse Act (1990)</h3>
        <p>Prevents unauthorised access to networks (hacking), the unauthorised modification of data, and the creation of malware.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--dark-purple);">
        <h3>Copyright, Designs & Patents Act (1988)</h3>
        <p>Makes it illegal to copy or share intellectual property (like music, software, or ideas) without the owner's permission.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Freedom of Information Act (2000)</h3>
        <p>Provides public access to information held by public sector organisations like the NHS, police, and schools to ensure transparency.</p>
      </div>
      <div class="card" style="border-top: 5px solid var(--accent-green);">
        <h3>Creative Commons Licensing</h3>
        <p>Allows owners to specify how others can use and share their work (e.g., non-commercial use only or requiring attribution).</p>
      </div>
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
        <p style="margin:0; color: #333; font-size: 0.95rem;">Try reading and fixing broken code in our side-by-side workspace.</p>
      </div>
      <button onclick="loadContent('prac_debugging')" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; white-space: nowrap;">Try Debugging 🐛</button>
    </div>

    <h2 class="section-title">Level 1: The Basics (Sequence & Variables)</h2>
    <div class="card-grid">
      <div class="card" style="border-top: 5px solid #28a745;">
        <h3>Challenge 001</h3>
        <p>Ask for the user's first name and display the output message Hello [First Name].</p>
        <button onclick="let sol=document.getElementById('sol-001'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-001" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">firstname = input("Please enter your first name: ")
print("Hello", firstname)</div>
      </div>

      <div class="card" style="border-top: 5px solid #28a745;">
        <h3>Challenge 002</h3>
        <p>Ask for the user’s first name and then ask for their surname and display the output message: Hello [First Name] [Surname].</p>
        <button onclick="let sol=document.getElementById('sol-002'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-002" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">firstname = input("Please enter your first name: ")
surname = input("Please enter your surname: ")
print("Hello", firstname, surname)</div>
      </div>

      <div class="card" style="border-top: 5px solid #28a745;">
        <h3>Challenge 003</h3>
        <p>Write code that will display the joke "What do you call a bear with no teeth?" and on the next line display the answer "A gummy bear!" Try to create it using only one line of code.</p>
        <button onclick="let sol=document.getElementById('sol-003'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-003" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">print("What do you call a bear with no teeth?\\nA gummy bear!")</div>
      </div>

      <div class="card" style="border-top: 5px solid #28a745;">
        <h3>Challenge 004</h3>
        <p>Ask the user to enter two numbers. Add them together and display the answer as The total is [answer].</p>
        <button onclick="let sol=document.getElementById('sol-004'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-004" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num1 = int(input("Please enter your first number: "))
num2 = int(input("Please enter your second number: "))
answer = num1 + num2
print("The total is", answer)</div>
      </div>

      <div class="card" style="border-top: 5px solid #28a745;">
        <h3>Challenge 005</h3>
        <p>Ask the user to enter three numbers. Add together the first two numbers and then multiply this total by the third. Display the answer as The answer is [answer].</p>
        <button onclick="let sol=document.getElementById('sol-005'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-005" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num1 = int(input("Please enter your first number: "))
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
        <div id="sol-012" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num1 = int(input("Enter first number: "))
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
        <div id="sol-013" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num = int(input("Enter a value less than 20: "))
if num >= 20:
    print("Too high")
else:
    print("Thank you")</div>
      </div>

      <div class="card" style="border-top: 5px solid #ffc107;">
        <h3>Challenge 014</h3>
        <p>Ask the user to enter a number between 10 and 20 (inclusive). If they enter a number within this range, display the message "Thank you", otherwise display the message "Incorrect answer".</p>
        <button onclick="let sol=document.getElementById('sol-014'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-014" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num = int(input("Enter a value between 10 and 20: "))
if num >= 10 and num <= 20:
    print("Thank you")
else:
    print("Incorrect answer")</div>
      </div>

      <div class="card" style="border-top: 5px solid #ffc107;">
        <h3>Challenge 015</h3>
        <p>Ask the user to enter their favourite colour. If they enter "red", "RED" or "Red" display the message "I like red too", otherwise display the message "I don't like [colour], I prefer red".</p>
        <button onclick="let sol=document.getElementById('sol-015'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-015" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">colour = input("Type in your favourite colour: ")
if colour == "red" or colour == "RED" or colour == "Red":
    print("I like red too")
else:
    print("I don't like", colour, ", I prefer red")</div>
      </div>

      <div class="card" style="border-top: 5px solid #ffc107;">
        <h3>Challenge 016</h3>
        <p>Ask the user if it is raining and convert their answer to lower case. If they answer "yes", ask if it is windy. If they answer "yes" to this second question, display "It is too windy for an umbrella", otherwise display "Take an umbrella". If they did not answer yes to the first question, display "Enjoy your day".</p>
        <button onclick="let sol=document.getElementById('sol-016'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-016" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">raining = input("Is it raining? ")
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
        <div id="sol-035" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">name = input("Type in your name: ")
for i in range(0,3):
    print(name)</div>
      </div>

      <div class="card" style="border-top: 5px solid #fd7e14;">
        <h3>Challenge 036</h3>
        <p>Alter program 035 so that it will ask the user to enter their name and a number and then display their name that number of times.</p>
        <button onclick="let sol=document.getElementById('sol-036'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-036" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">name = input("Type in your name: ")
num = int(input("Enter a number: "))
for i in range(0,num):
    print(name)</div>
      </div>

      <div class="card" style="border-top: 5px solid #fd7e14;">
        <h3>Challenge 037</h3>
        <p>Ask the user to enter their name and display each letter in their name on a separate line.</p>
        <button onclick="let sol=document.getElementById('sol-037'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-037" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">name = input("Enter your name: ")
for i in name:
    print(i)</div>
      </div>

      <div class="card" style="border-top: 5px solid #fd7e14;">
        <h3>Challenge 038</h3>
        <p>Change program 037 to also ask for a number. Display their name (one letter at a time on each line) and repeat this for the number of times they entered.</p>
        <button onclick="let sol=document.getElementById('sol-038'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-038" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num = int(input("Enter a number: "))
name = input("Enter your name: ")
for x in range(0,num):
    for i in name:
        print(i)</div>
      </div>

      <div class="card" style="border-top: 5px solid #fd7e14;">
        <h3>Challenge 039</h3>
        <p>Ask the user to enter a number between 1 and 12 and then display the times table for that number.</p>
        <button onclick="let sol=document.getElementById('sol-039'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-039" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num = int(input("Enter a number between 1 and 12: "))
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
        <div id="sol-045" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">total = 0
while total <= 50:
    num = int(input("Enter a number: "))
    total = total + num
    print("The total is...", total)</div>
      </div>

      <div class="card" style="border-top: 5px solid #dc3545;">
        <h3>Challenge 046</h3>
        <p>Ask the user to enter a number. Keep asking until they enter a value over 5 and then display the message "The last number you entered was a [number]" and stop the program.</p>
        <button onclick="let sol=document.getElementById('sol-046'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-046" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num = 0
while num <= 5:
    num = int(input("Enter a number: "))
print("The last number you entered was a", num)</div>
      </div>

      <div class="card" style="border-top: 5px solid #dc3545;">
        <h3>Challenge 047</h3>
        <p>Ask the user to enter a number and then enter another number. Add these two numbers together and then ask if they want to add another number. If they enter "y", ask them to enter another number and keep adding numbers until they do not answer "y". Once the loop has stopped, display the total.</p>
        <button onclick="let sol=document.getElementById('sol-047'); if(sol.style.display==='none'){sol.style.display='block'; this.innerText='Hide Solution';}else{sol.style.display='none'; this.innerText='Show Solution';}" style="margin-top:auto; padding:8px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">Show Solution</button>
        <div id="sol-047" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">num1 = int(input("Enter a number: "))
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
        <div id="sol-048" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">again = "y"
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
        <div id="sol-049" style="display:none; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:4px; font-family:monospace; font-size:0.85rem; white-space:pre-wrap;">compnum = 50
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

    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
      <button onclick="showBugScenario(1)" style="padding: 8px 12px; background: var(--dark-purple); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">1. Infinite Loop</button>
      <button onclick="showBugScenario(2)" style="padding: 8px 12px; background: var(--dark-purple); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">2. Array Crash</button>
      <button onclick="showBugScenario(3)" style="padding: 8px 12px; background: var(--dark-purple); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">3. Syntax Error</button>
      <button onclick="showBugScenario(4)" style="padding: 8px 12px; background: var(--dark-purple); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">4. Out of Bounds</button>
      <button onclick="showBugScenario(5)" style="padding: 8px 12px; background: var(--dark-purple); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">5. Method Error</button>
      <button onclick="showBugScenario(6)" style="padding: 8px 12px; background: var(--dark-purple); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">6. Scope Logic</button>
      <button onclick="showBugScenario(7)" style="padding: 8px 12px; background: var(--dark-purple); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">7. Type Error</button>
      <button onclick="showBugScenario(8)" style="padding: 8px 12px; background: var(--dark-purple); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">8. Missing Return</button>
      <button onclick="showBugScenario(9)" style="padding: 8px 12px; background: var(--dark-purple); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">9. Range Logic</button>
      <button onclick="showBugScenario(10)" style="padding: 8px 12px; background: var(--dark-purple); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">10. Boolean Logic</button>
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
        
        <button onclick="document.getElementById('bug-hint').style.display='block'" style="margin-top: 15px; padding: 10px; background: #ffc107; color: #333; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Give me a hint</button>
        <div id="bug-hint" style="display: none; margin-top: 10px; background: #fff3cd; padding: 10px; border-radius: 5px; color: #856404; font-size: 0.9rem;">
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

    <button onclick="goBack()" style="margin-top: 30px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
  `,

};

// --- NEW: Page Dictionary for Search & Smart Back ---
const pageTitles = {
  'home': 'Dashboard', 'p1_hub': 'Paper 1 Hub', 'p2_hub': 'Paper 2 Hub', 'prac_hub': 'Practical Hub', 'resources': 'Revision Resources',
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
};

// --- NEW: Debugging Scenario Logic ---
function showBugScenario(num) {
  document.getElementById('bug-hint').style.display = 'none';
  
  const title = document.getElementById('bug-title');
  const context = document.getElementById('bug-context');
  const code = document.getElementById('bug-code');
  const hint = document.getElementById('bug-hint');

  switch(num) {
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
let historyStack = ['home'];
let isGoingBack = false;
let searchIndex = [];

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
}

// Run on boot
window.addEventListener('DOMContentLoaded', () => {
  buildSearchIndex();
  
  // Initialize Dark Mode based on LocalStorage
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('theme-toggle').innerText = '☀️';
  }
});

// --- NEW: Global Search Function ---
function handleSearch() {
  const query = document.getElementById('global-search').value.toLowerCase();
  const resultsDiv = document.getElementById('search-results');
  
  if (!query) { 
    resultsDiv.style.display = 'none'; 
    return; 
  }

  // Filter the index based on the query (search term or definition)
  const matches = searchIndex.filter(item =>
    item.title.toLowerCase().includes(query) ||
    (item.desc && item.desc.toLowerCase().includes(query))
  ).slice(0, 6); // Limit to top 6 results

  if (matches.length > 0) {
    resultsDiv.innerHTML = matches.map(m =>
      `<div onclick="executeSearch('${m.id}')">
          <strong style="color: var(--dark-purple);">${m.title}</strong> <span style="font-size: 0.8rem; color: #888; background: #eee; padding: 2px 5px; border-radius: 4px; margin-left: 5px;">${m.type}</span>
          ${m.desc ? `<br><span style="font-size:0.85rem; color:#555;">${m.desc.substring(0,60)}${m.desc.length > 60 ? '...' : ''}</span>` : ''}
        </div>`
    ).join('');
    resultsDiv.style.display = 'block';
  } else {
    resultsDiv.innerHTML = '<div style="padding:15px; color:#777; text-align: center;">No matching terms or topics found.</div>';
    resultsDiv.style.display = 'block';
  }
}

function executeSearch(pageId) {
  loadContent(pageId);
  document.getElementById('search-results').style.display = 'none';
  document.getElementById('global-search').value = '';
}

// Close search dropdown if clicked outside
document.addEventListener('click', (e) => {
  if(!e.target.closest('.search-container')) {
      document.getElementById('search-results').style.display = 'none';
  }
});

// --- NEW: Dark Mode Toggle ---
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  
  // Save to LocalStorage
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  // Update icon
  document.getElementById('theme-toggle').innerText = isDark ? '☀️' : '🌙';
}

function updateSmartBackButton() {
  const backBtn = document.getElementById('smart-back-btn');
  const tooltip = document.getElementById('back-tooltip');
  
  if (historyStack.length > 1) {
    backBtn.style.display = 'flex';
    const prevPageId = historyStack[historyStack.length - 2];
    tooltip.innerText = `Back to ${pageTitles[prevPageId] || 'Previous Page'}`;
  } else {
    backBtn.style.display = 'none';
  }
}

function toggleNav() {
  document.getElementById("menu-btn").classList.toggle("change");
  document.getElementById("sidebar").classList.toggle("sidebar-open");
  document.getElementById("main-content").classList.toggle("main-push");
  document.body.classList.toggle("sidebar-open-logo");
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

function loadContent(topic) {
  const display = document.getElementById("display-area");

  if (contentData[topic]) {
    display.innerHTML = contentData[topic];

    // NEW: Properly push to history stack if we aren't using the back button
    if (!isGoingBack) {
      if (historyStack[historyStack.length - 1] !== topic) {
        historyStack.push(topic);
      }
    }
    isGoingBack = false; // Reset flag
    updateSmartBackButton(); // Update floating button

    if (topic === 'home') {
      updateCountdowns();
    }
    else if (topic === 'p1_revision') {
      shuffledCards = [...p1_cards];
      shuffleArray(shuffledCards);
      currentCardIndex = 0;
      updateCard();
    } else if (topic === 'p2_revision') {
      shuffledCards = [...p2_cards];
      shuffleArray(shuffledCards);
      currentCardIndex = 0;
      updateCard();
    }
  }

  if (window.innerWidth < 768) toggleNav();
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Quality of life improvement
}

function goBack() {
  if (historyStack.length > 1) {
    isGoingBack = true;
    historyStack.pop(); // Remove current page
    const previousPage = historyStack[historyStack.length - 1]; // Get previous page
    loadContent(previousPage);
  } else {
    loadContent('home');
  }
}

// Drag and Drop Logic
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const draggedElement = document.getElementById(data);
  const dropZone = ev.target.closest('.drop-zone');
  const feedback = document.getElementById('game-feedback');

  if (dropZone) {
    const correctPhase = draggedElement.getAttribute('data-phase');
    const targetPhase = dropZone.id;

    if (correctPhase === targetPhase) {
      dropZone.appendChild(draggedElement);
      draggedElement.style.background = "#28a745"; // Success Green
      draggedElement.style.cursor = "default";
      draggedElement.setAttribute("draggable", "false");
      feedback.innerText = "Correct! " + draggedElement.innerText + " placed.";
      feedback.style.color = "green";
    } else {
      feedback.innerText = "Incorrect placement for " + draggedElement.innerText + ". Try again.";
      feedback.style.color = "#dc3545";
    }
  }
}

// Checklist Logic
function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = (modal.style.display === "block") ? "none" : "block";
  }
}

function saveCheck(checkbox) {
  localStorage.setItem(checkbox.id, checkbox.checked);
}

function restoreChecks() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(box => {
    const savedState = localStorage.getItem(box.id);
    if (savedState === 'true') {
      box.checked = true;
    }
  });
}

window.onclick = function (event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = "none";
  }
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
  { term: "Topology", def: "The physical or logical layout of a network, such as Star, Mesh, Bus, or Ring." },
  { term: "Star Topology", def: "A network where all nodes connect to a central switch or hub; easy to add devices but relies on the central node." },
  { term: "Mesh Topology", def: "A network where every node is connected to every other node, providing high reliability and 'self-healing' properties." },
  { term: "Protocol", def: "A set of rules that allow devices to communicate by defining how data is formatted and sent." },
  { term: "Packet Switching", def: "The process of breaking data into small 'packets' to be sent across a network and reassembled at the destination." },
  { term: "TCP/IP Layer Stack", def: "A four-layer model (Application, Transport, Internet, Link) that ensures different hardware can communicate." },
  { term: "HTTP/HTTPS", def: "Protocols for web browsers to access websites; HTTPS uses encryption for security." },
  { term: "FTP", def: "File Transfer Protocol; used specifically for moving files between computers over a network." },
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

// Fisher-Yates Shuffle Algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
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
    term.innerText = shuffledCards[currentCardIndex].term;
    def.innerText = shuffledCards[currentCardIndex].def;
    counter.innerText = (currentCardIndex + 1) + " / " + shuffledCards.length;
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
  if (currentCardIndex > 0) {
    currentCardIndex--;
    updateCard();
  }
}

async function startLinearSearch() {
  const container = document.getElementById('linear-viz-container');
  const status = document.getElementById('linear-viz-info');
  const targetText = document.getElementById('linear-target-val');
  const startBtn = document.getElementById('linear-start-btn');

  // Generate random data
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
    // FIX: Added $ for boxWidth and left position calculation
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
    // FIX: Added $ for index, current value, and target
    status.innerText = `Checking index ${i}: Is ${values[i]} === ${target}?`;

    // Highlight current box (Orange/Yellow)
    boxes[i].style.background = '#ffc107';
    boxes[i].style.transform = 'scale(1.1)';

    await new Promise(r => setTimeout(r, 1000)); // Slower speed as requested

    if (values[i] === target) {
      boxes[i].style.background = 'var(--accent-green)';
      boxes[i].style.transform = 'scale(1.2)';
      // FIX: Added $ for target and index
      status.innerText = `Match Found! ${target} is at index ${i}.`;
      return;
    }

    // Fade out non-matches
    boxes[i].style.background = '#444';
    boxes[i].style.opacity = '0.5';
    boxes[i].style.transform = 'scale(1)';
  }

  status.innerText = "Value not found in list.";
}

let isSorting = false;

async function startBubbleSort() {
  if (isSorting) return;
  isSorting = true;
  document.getElementById('start-btn').disabled = true;

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
      
      // FIX: Added $ for values[j] and values[j + 1]
      status.innerText = `Comparing ${values[j]} and ${values[j + 1]}`;

      // Wait for user to see the comparison (800ms)
      await new Promise(resolve => setTimeout(resolve, 800));

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
}

async function startBinarySearch() {
  const container = document.getElementById('binary-viz-container');
  const status = document.getElementById('viz-step-info');
  const targetText = document.getElementById('target-val');
  const startBtn = document.getElementById('binary-start-btn');

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
    // FIX: Added $ before {mid} and {values[mid]}
    status.innerText = `Checking middle index ${mid} (Value: ${values[mid]})`;

    await new Promise(r => setTimeout(r, 1200));

    if (values[mid] === target) {
      bars[mid].style.background = 'var(--accent-green)';
      bars[mid].style.transform = 'scale(1.2)';
      // FIX: Added $ before {target} and {mid}
      status.innerText = `Found ${target} at index ${mid}!`;
      return;
    }

    if (values[mid] < target) {
      // FIX: Added $ before {values[mid]}
      status.innerText = `${values[mid]} is too low. Discarding left half.`;
      low = mid + 1;
    } else {
      // FIX: Added $ before {values[mid]}
      status.innerText = `${values[mid]} is too high. Discarding right half.`;
      high = mid - 1;
    }

    await new Promise(r => setTimeout(r, 800));
    bars[mid].style.transform = 'scale(1)';
    if (values[mid] !== target) bars[mid].style.background = '#888';
  }

  status.innerText = "Value not found.";
}

async function startMergeSort() {
  const container = document.getElementById('merge-viz-container');
  const status = document.getElementById('merge-viz-status');
  const startBtn = document.getElementById('merge-start-btn');

  startBtn.disabled = true;
  let values = [42, 31, 52, 26, 15, 60, 10, 88, 5, 22];
  const boxWidth = 50;
  const gap = 30;

  container.innerHTML = '';
  let boxes = values.map((val, i) => {
    const box = document.createElement('div');
    box.innerText = val;
    // FIX: Added $ for boxWidth and left positioning calculations
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

    await mergeSort(arr, l, m, depth + 1);
    await mergeSort(arr, m + 1, r, depth + 1);
    await merge(arr, l, m, r, depth);
  }

  await mergeSort(values, 0, values.length - 1, 0);
  status.innerText = "Merge Sort Complete!";
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
  // FIX: Added $ before {compressed}
  resultDiv.innerText = `Result: ${compressed}`;
}

function revealHuffman() {
  const status = document.getElementById('huff-status');
  status.innerHTML = "<strong>'N' appears twice</strong>, so it gets the shortest code: <strong>0</strong>.<br>The total bits saved compared to ASCII is roughly 50%!";
}

function checkHuffmanTree() {
  const p1 = document.getElementById('huff-path-1').value.trim();
  const p2 = document.getElementById('huff-path-2').value.trim();
  const feedback = document.getElementById('huff-feedback');

  if (p1 === "0" && p2 === "1") {
    feedback.innerHTML = "<span style='color: var(--accent-green)'>Correct!</span> The code for 'N' is 0, which is the shortest possible path.";
    document.getElementById('huff-path-1').style.borderColor = "var(--accent-green)";
    document.getElementById('huff-path-2').style.borderColor = "var(--accent-green)";
  } else {
    feedback.innerHTML = "<span style='color: var(--accent-red)'>Try again.</span> Remember: Left = 0, Right = 1.";
    document.getElementById('huff-path-1').style.borderColor = "var(--accent-red)";
    document.getElementById('huff-path-2').style.borderColor = "var(--accent-red)";
  }
}

function checkFullHuffman() {
  const sums = {
    s6: document.getElementById('node-sum-6').value,
    s4: document.getElementById('node-sum-4').value,
    s3: document.getElementById('node-sum-3').value,
    s2: document.getElementById('node-sum-2').value
  };
  const letters = {
    B: document.getElementById('node-letter-B').value.toUpperCase(),
    A: document.getElementById('node-letter-A').value.toUpperCase(),
    E: document.getElementById('node-letter-E').value.toUpperCase(),
    D: document.getElementById('node-letter-D').value.toUpperCase()
  };

  const isCorrect = (sums.s6 == "6" && sums.s4 == "4" && sums.s3 == "3" && sums.s2 == "2") &&
    (letters.B === "B" && letters.A === "A" && letters.E === "E" && letters.D === "D");

  const feedback = document.getElementById('huff-feedback');
  if (isCorrect) {
    feedback.innerHTML = "<span style='color: var(--accent-green)'>Excellent!</span> You correctly built the tree. 'N' now has a 1-bit code, while 'E' and 'D' have 4-bit codes.";
  } else {
    feedback.innerHTML = "<span style='color: var(--accent-red)'>Incorrect.</span> Check your sums (add the two branches below) and letter placements.";
  }
}

function runThreatLogic(type) {
  const stage = document.getElementById('viz-stage-title');
  const source = document.getElementById('viz-source');
  const path = document.getElementById('viz-path');
  const target = document.getElementById('viz-target');
  const desc = document.getElementById('viz-explanation');

  // Reset visuals
  source.style.opacity = "1";
  target.style.opacity = "1";
  path.style.color = "var(--accent-green)";

  if (type === 'virus') {
    stage.innerText = "Virus: The Replicator";
    source.innerText = "📁"; // Infected file
    target.innerText = "💻"; // Host PC
    path.innerText = "──(User Opens File)──>";
    desc.innerHTML = `
      1. <strong>Infection:</strong> Virus hides inside a legitimate file.<br>
      2. <strong>Trigger:</strong> User manually opens the infected file.<br>
      3. <strong>Action:</strong> Replicates into other files to damage or delete data.
    `;
  }
  else if (type === 'worm') {
    stage.innerText = "Worm: The Network Crawler";
    source.innerText = "🪱";
    target.innerText = "🌐"; // Network
    path.innerText = "──(Auto-Spreading)──>";
    desc.innerHTML = `
      1. <strong>Self-Replication:</strong> Does NOT need a host file or user action.<br>
      2. <strong>Spread:</strong> Uses network vulnerabilities to travel to other devices.<br>
      3. <strong>Impact:</strong> Clogs bandwidth and uses up system resources.
    `;
  }
  else if (type === 'trojan') {
    stage.innerText = "Trojan: The Deceiver";
    source.innerText = "🎁"; // "Gift"
    target.innerText = "🔓"; // Backdoor
    path.innerText = "──(Hidden Backdoor)──>";
    desc.innerHTML = `
      1. <strong>Disguise:</strong> Appears as useful software, like a free game.<br>
      2. <strong>Installation:</strong> User willingly installs the 'gift'.<br>
      3. <strong>Payload:</strong> Creates a 'backdoor' for hackers to access files.
    `;
  }
  else if (type === 'phishing') {
    stage.innerText = "Phishing: The Social Lure";
    source.innerText = "🎣";
    target.innerText = "👤"; // Victim
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
  // FIX: Added $ before {message}, {phishCount}, and {totalPhish}
  feedback.innerHTML = `✅ Found: ${message}<br>Progress: ${phishCount} / ${totalPhish}`;

  if (phishCount === totalPhish) {
    feedback.innerHTML = "🎉 Excellent! You spotted all the red flags. Always check the sender, the link, and look out for generic greetings or threats of urgency.";
    phishCount = 0; // Reset for next time
  }
}

async function runAttackLogic(type) {
  const status = document.getElementById('server-status');
  const loadBar = document.getElementById('load-bar');
  const consoleOut = document.getElementById('console-output');

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
        // FIX: Added $ before {currentAttempt} and {char}
        consoleOut.innerHTML = `> Attacking... <br><span style="font-size: 2rem; color: #0f0; letter-spacing: 5px;">${currentAttempt}${char}</span>`;

        // Artificial delay for visual effect
        await new Promise(r => setTimeout(r, 40));

        if (char === targetPassword[i]) {
          currentAttempt += char;
          foundChar = true;
          break;
        }
      }
    }

    // Final Success State
    // FIX: Added $ before {currentAttempt}
    consoleOut.innerHTML = `> Success! Password found: <br><span style="font-size: 2rem; color: var(--accent-green); letter-spacing: 5px;">${currentAttempt}</span>`;
    status.innerText = "SERVER STATUS: UNAUTHORISED ACCESS";
    status.style.color = "#fd7e14";
  }

  else if (type === 'dos') {
    consoleOut.innerText = "> Flooding server with traffic...";
    let load = 5;
    const interval = setInterval(() => {
      load += 15;
      loadBar.style.width = load + "%";
      consoleOut.innerHTML += "<br>> Packet sent...";
      if (load >= 95) {
        clearInterval(interval);
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
    consoleOut.innerHTML += "<br>> Injecting: ' OR 1=1 --";
    await new Promise(r => setTimeout(r, 800));
    consoleOut.innerHTML += "<br>> Database Query Manipulated. Access Granted.";
    status.innerText = "SERVER STATUS: DATA LEAK DETECTED";
    status.style.color = "#dc3545";
  }
}

if (topic === 'p2_revision') {
  shuffledCards = [...p2_cards]; // Use the new Paper 2 list
  shuffleArray(shuffledCards);
  currentCardIndex = 0;
  updateCard();
}

function updateCountdowns() {
  const tags = document.querySelectorAll('.countdown-tag');
  const weekTags = document.querySelectorAll('.weeks-tag');
  const today = new Date("2026-03-02"); // Your static dashboard date

  tags.forEach((tag, index) => {
    const dateStr = tag.getAttribute('data-due');
    if (!dateStr) return;
    const dueDate = new Date(dateStr);
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    tag.innerText = daysLeft + " Days Left";

    if (daysLeft > 0) {
      const totalWeeks = Math.floor(daysLeft / 7);

      // FIX: Calculate school weeks dynamically for EACH card
      const easterWeeks = 2;
      const schoolWeeks = totalWeeks - easterWeeks;

      if (weekTags[index]) {
        weekTags[index].innerText = totalWeeks + " Total Weeks Left";
      }

      // Dynamically target the breakdown paragraph for each specific paper
      const breakdownId = index === 0 ? 'p1-breakdown' : 'p2-breakdown';
      const breakdownEl = document.getElementById(breakdownId);

      if (breakdownEl) {
        breakdownEl.innerHTML = `Includes <strong>${schoolWeeks} School Weeks</strong> and <strong>2 Weeks of Easter Break</strong>.`;
      }
    }
  });
}

// Full homework schedule from the provided document
const homeworkSchedule = [
  { date: "2025-09-19", topic: "3.1 Fundamentals of algorithms", detail: "Create a mind map explaining the principles of computational thinking." },
  { date: "2025-09-26", topic: "3.1 Fundamentals of algorithms", detail: "Create two simple algorithms (average, recipe) using pseudocode and flowcharts." },
  { date: "2025-10-03", topic: "3.1 Fundamentals of algorithms", detail: "Make revision cards for searching and sorting algorithms with annotated data sets." },
  { date: "2025-10-10", topic: "Revision", detail: "Answer a selection of past exam questions on Topic 3.1." },
  { date: "2025-10-17", topic: "3.2 Programming", detail: "Make revision cards on fundamental programming concepts with Python examples." },
  { date: "2025-10-24", topic: "3.2 Programming", detail: "Create a mind map illustrating sequence, selection, and iteration with examples." },
  { date: "2025-11-07", topic: "3.2 Programming", detail: "Explain subroutines and create a program using a 1D array/list." },
  { date: "2025-11-14", topic: "Revision", detail: "Answer past exam questions on Topic 3.2. Annotate logic errors." },
  { date: "2025-11-21", topic: "3.3 Data representation", detail: "Revision cards for denary, binary, and hex conversions + binary addition." },
  { date: "2025-11-28", topic: "3.3 Data representation", detail: "Table comparing binary representation of characters, bitmaps, and sound." },
  { date: "2025-12-05", topic: "3.3 Data representation", detail: "Explain the difference between lossy and lossless compression with use cases." },
  { date: "2025-12-12", topic: "Revision", detail: "Complete practice questions on number systems and data representation." },
  { date: "2026-01-09", topic: "Synoptic Revision", detail: "Design an algorithm (3.1) and write the corresponding code (3.2)." },
  { date: "2026-01-16", topic: "Revision", detail: "Answer a selection of past exam questions on Topic 3.3." },
  { date: "2026-01-23", topic: "3.4 Computer systems", detail: "Label Von Neumann architecture and explain Fetch-Decode-Execute." },
  { date: "2026-01-30", topic: "3.4 Computer systems", detail: "Comparison table for memory/storage (speed, cost, capacity, volatility)." },
  { date: "2026-02-06", topic: "3.4 Computer systems", detail: "Revision cards on OS functions and common utility software." },
  { date: "2026-02-13", topic: "Revision", detail: "Answer past exam questions on Topic 3.4. Review misconceptions." },
  { date: "2026-02-27", topic: "3.5 Computer networks", detail: "Mind map explaining LAN vs WAN and star/mesh topologies." },
  { date: "2026-03-06", topic: "3.5 Computer networks", detail: "Revision cards for network hardware and the 4-layer TCP/IP model." },
  { date: "2026-03-13", topic: "3.5 Computer networks", detail: "Diagram illustrating DNS, hosting, and the cloud." },
  { date: "2026-03-20", topic: "Revision", detail: "Answer a selection of past exam questions on Topic 3.5." },
  { date: "2026-03-27", topic: "Revision", detail: "Complete Seneca Learning quizzes covering Topics 3.3, 3.4, and 3.5." },
  { date: "2026-04-24", topic: "Consolidation", detail: "Complete a full past paper (Paper 1 or Paper 2)." }
];

