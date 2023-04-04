const CURSOR = '<span class="cursor"></span>';
const WELCOME = `
  ################################
  # Aleksey Goroshevskiy, 29     #
  # TeamLead / Lead Frontend Dev #
  # Dubai, UAE                   #
  ################################

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
    this.reinitializeTerm();
  }

  reinitializeTerm() {
    if (this.termBuffer.length > TERM_MAX_LENGTH) {
      this.termBuffer = this.termBuffer.slice(this.termBuffer.length - TERM_MAX_LENGTH);
    }

    this.term$.innerHTML = this.termBuffer + LINE_BEGINNING + CURSOR;
    window.scrollTo(0, this.term$.scrollHeight);
  }

  onClickOnTermListener(callback) {
    this.term$.addEventListener('click', callback);
  }

  typeLetter(leftInputBuffer, rightInputBuffer) {
    this.term$.innerHTML = this.termBuffer + LINE_BEGINNING + leftInputBuffer + CURSOR + rightInputBuffer;
  }

  enterLine(inputBuffer) {
    this.termBuffer += LINE_BEGINNING + inputBuffer;

    const command = inputBuffer.split(' ')[0].trim();

    this.proceedCommand(command);
    this.reinitializeTerm();
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

    this.term.onClickOnTermListener(this.focusOnInput.bind(this));

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

    this.term.typeLetter(this.leftInputBuffer, this.rightInputBuffer);
  }

  focusOnInput(e = null) {
    e?.preventDefault();

    if (!window.getSelection().toString()) {
      this.input$.focus({preventScroll: true});
    }
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
  }

  onHistoryDown() {
    if (this.historyInd === this.inputHistory.length) {
      return;
    }

    this.inputHistory[this.historyInd] = this.leftInputBuffer;

    this.leftInputBuffer = this.historyInd === this.inputHistory.length - 1
      ? this.inputHistory.pop()
      : this.inputHistory[++this.historyInd];
  }
}

const term = new Term();
new Input(term);

const TEXT_COMMANDS = {
  about: `
I've been developing for more than 12
years. My first projects were in C and
Python, ranging from small scripts,
bots, and simple applications with
routine automation and scientific
visualization to speech recognition with
ML. After that, I worked as a frontend
developer for over six years. Mostly, I
worked with Angular and pure JS stacks
but also touched server-side Node.js,
Kotlin (with Spring), and even
TensorFlow.js. In addition, I spent a
lot of time writing unit and integration
tests and CI/CD pipelines.

For the last couple of years, I've been
challenging myself as a team leader.
These days, I work with a team,
including several frontend developers, a
backend developer, and a QA engineer. We
use Kanban methodology, TBD, team
metrics, and many other practices to
make our work more productive and
predictable for the business.

I've been working on complex fintech
projects and their frontend
infrastructure with modern software
stacks based on Nx and Angular. Also, I
have experience teaching frontend to
students. I'm looking forward to great
possibilities to make valuable and
practical software as a developer or
team leader.
  `,
  contacts: `
  telegram   @rissik
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
With honor
  `,
  exp: `
Tinkoff Bank
Russian largest fintech company
2017 - this time
TeamLead
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
  English    Upper Intermediate
  Russian    Native
  Arabic     Beginner
  `,
  skills: `
Angular,
Nx, TensorFlow.js, ML,
ngRx, rxJs, webpack, sockets, SSE
Units, Integrations, Jest, Cypress
PWA, Service Workers
Nest, Node.js, Bash
CI/CD, K8s, git, REST,
Leading, TBD, Agile, Kanban,
JavaScript, Typescript, Python, C, C#
Frontend, Backend, Full Stack,
... more ...
  `,
};

const SERVICE_COMMANDS = {
  clear: () => '',
};