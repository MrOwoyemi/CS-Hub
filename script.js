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

    <h2 style="margin-top: 40px;">Homework Reminders</h2>
    
    <div class="homework-card">
      <div class="homework-info">
        <h4>3.5 Computer networks</h4>
        <p><strong>Due:</strong> 27/02/2026</p>
        <p>Create a mind map explaining the pros and cons of LANs vs. WANs...</p>
      </div>
      <div class="countdown-tag" data-due="2026-02-27">Calculating...</div>
    </div>

    <div class="homework-card">
      <div class="homework-info">
        <h4>3.5 Computer networks</h4>
        <p><strong>Due:</strong> 06/03/2026</p>
        <p>Make revision cards for key network hardware and explain the concept of protocol layering using the 4-layer TCP/IP model.</p>
      </div>
      <div class="countdown-tag" data-due="2026-03-06">Calculating...</div>
    </div>

    <div class="homework-card" style="margin-bottom: 40px;">
      <div class="homework-info">
        <h4>3.5 Computer networks</h4>
        <p><strong>Due:</strong> 13/03/2026</p>
        <p>Draw a diagram illustrating the roles of DNS, hosting, and the cloud in the process of a user accessing a website. </p>
      </div>
      <div class="countdown-tag" data-due="2026-03-13">Calculating...</div>
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
    
    <button onclick="goBack()" style="margin-top: 20px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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

    <button onclick="goBack()" style="margin-top: 20px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
      <div class="card" onclick="loadContent('p1_prog')" style="cursor: pointer; border-left: 5px solid var(--accent-green);">
        <h3>Core Constructs</h3>
        <p>Sequence, Selection (If/Else), and Iteration (While/For loops).</p>
      </div>
      <div class="card" style="cursor: pointer; border-left: 5px solid var(--accent-green);">
        <h3>Data Structures</h3>
        <p>Lists (Arrays), 2D Lists, and Dictionaries.</p>
      </div>
      <div class="card" style="cursor: pointer; border-left: 5px solid var(--accent-green);">
        <h3>String Manipulation</h3>
        <p>Slicing, Casting, and ASCII conversion.</p>
      </div>
    </div>

    <h2 class="section-title">Coding Challenges</h2>
    <div class="homework-box">
      <p><strong>Easy:</strong> Write a program that asks for a name and prints it 5 times.</p>
      <p><strong>Medium:</strong> Write a program to calculate the average of numbers in a list.</p>
      <p><strong>Hard:</strong> Implement the Bubble Sort algorithm from scratch.</p>
    </div>

    <button onclick="goBack()" style="margin-top: 20px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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

    // Replace the "Representing Algorithms" section in your script.js with this:

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
    
    <button onclick="goBack()" style="margin-top: 20px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
      <li><strong>Time Complexity:</strong> $O(n)$ — In the worst case, you must check all $n$ items.</li>
      <li><strong>Prerequisite:</strong> None. Unlike Binary Search, the list does <strong>not</strong> need to be sorted.</li>
    </ul>
  </div>

  <button onclick="loadContent('p1_algo')" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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

  <button onclick="loadContent('p1_algo')" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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

  <button onclick="loadContent('p1_algo')" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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

  <button onclick="loadContent('p1_algo')" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
`,

  // --- 3.2 PROGRAMMING FUNDAMENTALS (Updated with Activity Buttons) ---
  p1_prog: `
    <h1>3.2 Programming Fundamentals</h1>
    <p>Programming involves using specific constructs to create instructions that a computer can process. Professional programmers aim to write code that is modular, easy to debug, and robust against errors[cite: 9].</p>

    <h2 class="section-title">1. Variables and Data Types</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Inputs, Variables & Outputs</h3>
        <p>A <strong>variable</strong> is a named memory location used to store an input that can change while the program runs[cite: 1]. In Python, we use <code>input()</code> to collect data and <code>print()</code> to display it[cite: 1].</p>
        <button onclick="loadContent('act_io')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try I/O Activity</button>
      </div>
      <div class="card">
        <h3>Common Data Types</h3>
        <ul>
          <li><strong>String:</strong> Combinations of keyboard characters (e.g. "Hello")[cite: 2].</li>
          <li><strong>Integer:</strong> Whole numbers (e.g. 5)[cite: 2].</li>
          <li><strong>Real (Float):</strong> Decimal numbers (e.g. 5.5)[cite: 2].</li>
          <li><strong>Boolean:</strong> True or False values[cite: 2].</li>
          <li><strong>Casting:</strong> Converting one data type to another, such as using <code>int()</code> to turn a string into a number[cite: 2].</li>
        </ul>
        <button onclick="loadContent('act_casting')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Casting Activity</button>
      </div>
    </div>

    <h2 class="section-title">2. Programming Constructs</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Selection (If-Else)</h3>
        <p>Selection allows programs to make decisions and take different pathways based on whether a condition is <strong>True</strong> or <strong>False</strong>[cite: 3].</p>
        <ul>
          <li><strong>IF:</strong> The primary condition check[cite: 3].</li>
          <li><strong>ELIF:</strong> Short for 'else if', used for multiple alternative conditions[cite: 3].</li>
          <li><strong>ELSE:</strong> The final pathway if no previous conditions are met[cite: 3].</li>
        </ul>
        <button onclick="loadContent('act_selection')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Selection Activity</button>
      </div>
      <div class="card">
        <h3>Iteration (Loops)</h3>
        <p>Iteration enables the repeated execution of lines of code to make programs more efficient[cite: 4, 5].</p>
        <ul>
          <li><strong>Count-Controlled (FOR):</strong> Loops for a set number of iterations using a 'stepper' variable[cite: 4].</li>
          <li><strong>Condition-Controlled (WHILE):</strong> Loops as long as a specific condition remains True[cite: 5].</li>
        </ul>
        <button onclick="loadContent('act_loops')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Loops Activity</button>
      </div>
    </div>

    <h2 class="section-title">3. Advanced Data Handling</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Lists (Arrays)</h3>
        <p>A list stores a collection of data items together under a single identifier[cite: 8]. Items are <strong>indexed</strong> starting at <strong>zero</strong>[cite: 8].</p>
        <ul>
          <li><strong>append():</strong> Adds a new item to the end of a list[cite: 8].</li>
          <li><strong>2D Lists:</strong> A list that contains other lists[cite: 8].</li>
        </ul>
        <button onclick="loadContent('act_lists')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Lists Activity</button>
      </div>
      <div class="card">
        <h3>String Manipulation</h3>
        <p>String manipulation involves breaking down and examining strings using methods like <code>len()</code>, <code>upper()</code>, <code>lower()</code>, and <strong>Concatenation</strong>[cite: 6].</p>
        <button onclick="loadContent('act_strings')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Strings Activity</button>
      </div>
    </div>

    <h2 class="section-title">4. Robustness and Subroutines</h2>
    <div class="card-grid">
      <div class="card">
        <h3>Defensive Design</h3>
        <p>To ensure programs are robust, programmers use strategies like <strong>Validation</strong> (checking criteria), <strong>Authentication</strong> (verifying identity), and <strong>Error Handling</strong> (using try...except)[cite: 7].</p>
        <button onclick="loadContent('act_robust')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Robustness Activity</button>
      </div>
      <div class="card">
        <h3>Subroutines</h3>
        <p>A named block of code that only runs when called, providing a modularised approach for easier debugging[cite: 9].</p>
        <ul>
          <li><strong>Procedures:</strong> Do <strong>not</strong> return a value[cite: 9].</li>
          <li><strong>Functions:</strong> Do <strong>return</strong> a value[cite: 9].</li>
        </ul>
        <button onclick="loadContent('act_subroutines')" style="margin-top: 10px; padding: 8px 15px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Try Subroutines Activity</button>
      </div>
    </div>

    <button onclick="goBack()" style="margin-top: 20px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
      <button onclick="goBack()" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
      <button onclick="goBack()" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
      <button onclick="goBack()" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
      <button onclick="goBack()" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
      <button onclick="goBack()" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
      <button onclick="goBack()" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
      <button onclick="goBack()" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
      <button onclick="goBack()" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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

    <h2 class="section-title">2. Characters and Text</h2>
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

    <h2 class="section-title">3. Images and Sound</h2>
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

    <h2 class="section-title">4. Compression File Types</h2>
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

    <button onclick="goBack()" style="margin-top: 20px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
    <button onclick="loadContent('p2_data')" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
  
  <button onclick="loadContent('p2_data')" style="padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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

    <button onclick="goBack()" style="margin-top: 20px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
          <li><strong>IP Address:</strong> A 32-bit number (e.g. 192.168.1.1) used for routing data packets across a network.</li>
        </ul>
      </div>

      <div class="card" style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <h3>Core Protocols</h3>
        <p>Protocols are sets of rules that allow devices to speak the same language.</p>
        <ul style="flex-grow: 1;">
          <li><strong>TCP:</strong> Breaks data into packets and reassembles them.</li>
          <li><strong>IP:</strong> Responsible for routing the packets to the correct destination.</li>
          <li><strong>HTTP/HTTPS:</strong> Rules for web browsers to access websites (HTTPS is secure).</li>
          <li><strong>FTP:</strong> Used specifically for transferring files over a network.</li>
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
    <button onclick="goBack()" style="margin-top: 20px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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

    <button onclick="goBack()" style="margin-top: 20px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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

    <button onclick="goBack()" style="margin-top: 20px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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

    <button onclick="goBack()" style="margin-top: 20px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
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
    </div>

    <h2 class="resource-section-header">External Learning Tools</h2>
    <div class="card-grid">
      <div class="card" onclick="window.open('https://mrowoyemi.github.io/GCSE-COMP-SCI-TRAINER/', '_blank')" style="cursor: pointer; border-top: 5px solid #007BFF;">
        <h3>Mini Quiz Trainer</h3>
        <p>Rapid-fire questions for all AQA topics.</p>
      </div>
      <div class="card" onclick="window.open('https://crookhorncollege.itslearning.com/Resources?FolderID=1168750&PlayPlanDialogView=False', '_blank')" style="cursor: pointer; border-top: 5px solid #6f42c1;">
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
    
    <button onclick="goBack()" style="margin-top: 30px; padding: 10px 20px; background: var(--dark-purple); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
  `,
};

// --- History Management Variables ---
let historyStack = ['home'];
let isGoingBack = false;

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

    // This part is crucial - it triggers the math after the HTML exists
    if (topic === 'home') {
      updateCountdowns();
    }
    // Handle other activity initialisations
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
}

function goBack() {
  if (historyStack.length > 1) {
    isGoingBack = true;
    historyStack.pop();
    const previousPage = historyStack[historyStack.length - 1];
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

    if (values[i] === target) {
      boxes[i].style.background = 'var(--accent-green)';
      boxes[i].style.transform = 'scale(1.2)';
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
    status.innerText = `Checking middle index ${mid} (Value: ${values[mid]})`;

    await new Promise(r => setTimeout(r, 1200));

    if (values[mid] === target) {
      bars[mid].style.background = 'var(--accent-green)';
      bars[mid].style.transform = 'scale(1.2)';
      status.innerText = `Found ${target} at index ${mid}!`;
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
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789!@#$%^&*";
    let currentAttempt = "";

    // Video-style visualization: Cracking character by character
    for (let i = 0; i < targetPassword.length; i++) {
      let foundChar = false;

      // Cycle through charset to simulate searching
      for (let j = 0; j < charset.length; j++) {
        const char = charset[j];
        // Display current progress + random cycling char
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
  // Simulated 'today' date from your workbook context
  const today = new Date("2026-02-18");

  tags.forEach(tag => {
    const dateStr = tag.getAttribute('data-due');
    if (!dateStr) return;

    const dueDate = new Date(dateStr);
    // Calculate difference in milliseconds and convert to days
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      tag.innerText = "Overdue!";
      tag.style.background = "var(--accent-red)";
      tag.style.color = "white";
    } else if (daysLeft === 0) {
      tag.innerText = "Due Today";
      tag.style.background = "var(--accent-red)";
      tag.style.color = "white";
    } else {
      tag.innerText = daysLeft + " Days Left";
      // Visual urgency for tasks due within 3 days
      if (daysLeft <= 3) {
        tag.style.background = "var(--accent-red)";
        tag.style.color = "white";
      } else {
        tag.style.background = "#fff5f5";
        tag.style.color = "var(--accent-red)";
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

