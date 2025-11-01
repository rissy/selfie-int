const CURSOR = '<span class="cursor"></span>';
const WELCOME = `
  ##############################
  #  Aleksei Goroshevskii, 31  #
  #  UI/UX Architect           #
  #  Dubai, UAE                #
  ##############################

Type "help" for more information

`;
const LINE_BEGINNING = 'hr@rissik.me ~ % ';
const NOT_FOUND = 'command not found: ';

const INPUT_MAX_LENGTH = 20;
const TERM_MAX_LENGTH = 10000;

class Term {
  term$ = document.querySelector('.term');
  termBuffer = WELCOME;

  constructor() {
    this.reinitializeTerm(false);
  }

  reinitializeTerm(hasFocus = true) {
    if (this.termBuffer.length > TERM_MAX_LENGTH) {
      this.termBuffer = this.termBuffer.slice(this.termBuffer.length - TERM_MAX_LENGTH);
    }

    const cursor = hasFocus ? CURSOR : '';
    this.term$.innerHTML = this.termBuffer + `<span class="prompt-line">${LINE_BEGINNING}${cursor}</span>`;
    this.term$.scrollTop = this.term$.scrollHeight;
  }
  
  addPromptLineClickListener(focusCallback, blurCallback) {
    this.term$.addEventListener('click', (e) => {
      if (window.getSelection().toString()) {
        return;
      }

      const promptLine = this.term$.querySelector('.prompt-line');
      
      if (!promptLine) return;

      const promptLineTop = promptLine.offsetTop;
      const clickY = e.clientY - this.term$.getBoundingClientRect().top + this.term$.scrollTop;

      if (clickY >= promptLineTop) {
        focusCallback(e);
      } else {
        blurCallback();
      }
    });
  }

  typeLetter(leftInputBuffer, rightInputBuffer, hasFocus = true) {
    const cursor = hasFocus ? CURSOR : '';
    this.term$.innerHTML = this.termBuffer + `<span class="prompt-line">${LINE_BEGINNING}${leftInputBuffer}${cursor}${rightInputBuffer}</span>`;
  }

  enterLine(inputBuffer) {
    this.termBuffer += LINE_BEGINNING + inputBuffer;

    const command = inputBuffer.split(' ')[0].trim();

    this.proceedCommand(command);
    this.reinitializeTerm(true);
  }

  proceedCommand(command) {
    if (TEXT_COMMANDS[command]) {
      this.termBuffer += TEXT_COMMANDS[command] + '\n';
    } else if (SERVICE_COMMANDS[command]) {
      this.termBuffer = SERVICE_COMMANDS[command](this.termBuffer);
    } else if (!!command) {
      this.termBuffer += NOT_FOUND + command + '\n';
    }
  }
}

class Input {
  input$ = document.querySelector('.input');
  leftInputBuffer = '';
  rightInputBuffer = '';
  inputHistory = [];
  historyInd = 0;

  constructor(term) {
    this.term = term;
    this.initializeInput();
  }

  initializeInput() {
    this.input$.addEventListener('keydown', this.typeLetter.bind(this));
    
    this.input$.addEventListener('focus', this.onFocus.bind(this));
    this.input$.addEventListener('blur', this.onBlur.bind(this));
    
    this.term.addPromptLineClickListener(
        this.focusOnInput.bind(this),
        this.blurInput.bind(this)
    );

    this.focusOnInput();
  }

  typeLetter(e) {
    e.preventDefault();

    switch (e.keyCode) {
      case 8: // backspace
        this.leftInputBuffer = this.leftInputBuffer.slice(0, this.leftInputBuffer.length - 1);
        break;
      case 9: // tab
        this.leftInputBuffer += '\t';
        break;
      case 13: // enter
        this.onEnterLine();
        return;
      case 37: // arrow left
        this.rightInputBuffer = (this.leftInputBuffer[this.leftInputBuffer.length - 1] || '') + this.rightInputBuffer;
        this.leftInputBuffer = this.leftInputBuffer.slice(0, this.leftInputBuffer.length - 1);
        break;
      case 38: // arrow up
        this.onHistoryUp();
        break;
      case 39: // arrow right
        this.leftInputBuffer = this.leftInputBuffer + (this.rightInputBuffer[0] || '');
        this.rightInputBuffer = this.rightInputBuffer.slice(1);
        break;
      case 40: // arrow down
        this.onHistoryDown();
        break;
      default:
        if (
            (e.keyCode >= 48 && e.keyCode <= 90
                || e.keyCode >= 96 && e.keyCode <= 111
                || e.keyCode >= 186 && e.keyCode <= 192
                || e.keyCode >= 219 && e.keyCode <= 222
                || e.keyCode === 32)
            && !e.ctrlKey
            && !e.metaKey
        ) {
          if (this.leftInputBuffer.length === INPUT_MAX_LENGTH) {
            return;
          }

          this.leftInputBuffer += e.key;
        }
    }
    
    this.term.typeLetter(this.leftInputBuffer, this.rightInputBuffer, true);
  }

  focusOnInput(e = null) {
    e?.preventDefault();

    if (!window.getSelection().toString()) {
      this.input$.focus({preventScroll: true});
    }
  }
  
  blurInput() {
    this.input$.blur();
  }
  
  onFocus() {
    this.term.typeLetter(this.leftInputBuffer, this.rightInputBuffer, true);
  }
  
  onBlur() {
    this.term.typeLetter(this.leftInputBuffer, this.rightInputBuffer, false);
  }

  onEnterLine() {
    let inputBuffer = this.leftInputBuffer + this.rightInputBuffer;

    if (this.historyInd !== this.inputHistory.length) {
      this.inputHistory.pop();
    }

    if (inputBuffer !== '') {
      this.inputHistory.push(inputBuffer);
    }

    this.historyInd = this.inputHistory.length;

    inputBuffer += '\n';
    this.term.enterLine(inputBuffer);

    this.leftInputBuffer = '';
    this.rightInputBuffer = '';
  }

  onHistoryUp() {
    if (this.historyInd === 0) {
      return;
    }

    if (this.historyInd === this.inputHistory.length) {
      this.inputHistory.push(this.leftInputBuffer);
    } else {
      this.inputHistory[this.historyInd] = this.leftInputBuffer;
    }

    this.leftInputBuffer = this.inputHistory[--this.historyInd];
    this.term.typeLetter(this.leftInputBuffer, this.rightInputBuffer, true); // ДОБАВЛЕНО: Обновляем курсор
  }

  onHistoryDown() {
    if (this.historyInd === this.inputHistory.length) {
      return;
    }

    this.inputHistory[this.historyInd] = this.leftInputBuffer;

    this.leftInputBuffer = this.historyInd === this.inputHistory.length - 1
        ? this.inputHistory.pop()
        : this.inputHistory[++this.historyInd];
    this.term.typeLetter(this.leftInputBuffer, this.rightInputBuffer, true); // ДОБАВЛЕНО: Обновляем курсор
  }
}

const term = new Term();
new Input(term);

const TEXT_COMMANDS = {
  about: `
An experienced software architect and engineering leader with over 14 years in development.

My career began with C and Python, where I worked on everything from automation and scientific visualization to speech recognition using machine learning.

For more than seven years, I specialized in frontend development, primarily with Angular. During this time, my focus was on the hands-on development of scalable frontend platforms and infrastructure that supported dozens of B2B products. My technical expertise also extends to backend development with Node.js and Kotlin (Spring), setting up CI/CD pipelines, and integrating machine learning with TensorFlow.js. I also have a passion for education and experience in teaching frontend development to students.

I then transitioned into leadership, heading a cross-functional team of frontend, mobile, and QA engineers. As a leader, I focused on creating productive and predictable workflows using Kanban and team metrics, while collaborating closely with business teams to achieve shared company goals.

In my current role as a UI Architect, I architect scalable frontend and mobile platforms for the corporate banking sector by designing modular, high-performance architectures and ensuring their seamless integration across web and mobile applications.

I am driven to create valuable, practical software, whether in a hands-on architectural role or as an engineering leader.
  `,
  contacts: `
  signal     rissik.42
  linkedin   rissik
  email      hr@rissik.me
  `,
  duck: `
              .-\"\"-.
             /      \\
            /     (0 \\______
            |         \"_____)
            \\        ,-----\'
             \\_    _/   You\'re beautiful
              /    \\
             /      \\
            /        \\
           /          \\
          /        :   |
         /     ;   :   |
\\\\\\     /  _.-\'    :   |
 \\\\\\\\  / _\'        :   |
  \\\\\\\\/ ;         :   /
   \\\\  ;         :   /
    \\   \'._\'-\'_.\'  _/
     \\     \'\'\' _.-\'
      \\      / /
       \\    / /
        \\  /)(_______
         )(_________<
        (__________<
  `,
  edu: `
Master degree in Computer Science, 2018
Lomonosov Moscow State University
With Honours
  `,
  exp: `
T-Bank (ex. Tinkoff Bank)
Russian largest fintech company
2017 - this time
  `,
  help: `
List of available commands:
  about      a short introduction
  contacts   ways to contact with me
  duck       easter egg
  edu        information about education
  exp        my work experience
  help       this help
  langs      list of languages I speak
  skills     list of my skills
  `,
  langs: `
  English
  Russian
  `,
  skills: `
Frontend Architecture
System Design
Platform Development
Cross-functional Team Leadership
Angular
... and more
  `,
};

const SERVICE_COMMANDS = {
  clear: () => '',
};