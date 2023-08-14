
/* Data */
let start_task_time = 0;
let subjectData = {};


/* Assign task items */
const N_TASK = 30;
const ALL_ITEMS = [ 'tria', 'star', 'circ'];
const CONFIGS = {
  'tria': { 'prob': 0, 'cost': 0, 'reward': 0 },
  'star': { 'prob': 0.6, 'cost': 10, 'reward': 50 },
  'circ': { 'prob': 0.2, 'cost': 10, 'reward': 200 },
}
// const ADV_COLORS = ['limegreen', 'purple', 'pink', 'orange', 'lightskyblue' ];

let [ clickData, clickDataKeys ] =[ {}, [] ];
let [ task_items, task_cells, task_cell_item, task_scores ] = [ {}, {}, {}, [] ];

for (let i = 0; i < N_TASK; i++) {
  let task_size = 10; //randFromRange(2, 9);
  task_items[`task_${i+1}`] = [ 'tria', 'tria', 'star', 'star', 'star', 'star', 'circ','circ','circ','circ' ] //sampleFromList(ALL_ITEMS, n=task_size); // sample items

  let all_cell_ids = getAllCellIds();
  task_cells[`task_${i+1}`] = sampleFromList(all_cell_ids, n=task_size, replace=0); // sample cell-ids

  let fullCellIds = task_cells[`task_${i+1}`].map(el => `task${i+1}-grid-${el}`); // get full-name cell-ids
  fullCellIds.forEach((el, idx) => task_cell_item[el] = task_items[`task_${i+1}`][idx]); // append items

  clickDataKeys = clickDataKeys.concat(fullCellIds);

  task_scores.push(0)
}
clickDataKeys.forEach(el => clickData[el] = 0);


/* Collect prolific id */
function handle_prolific() {
  subjectData['prolific_id'] = getEl('prolific_id_text').value;
  hideAndShowNext('prolific_id', 'instruction', 'block');
}


/* Create task div */
for (let tid = 1; tid <= N_TASK; tid++) {

  let taskDiv = createCustomElement('div', '', `task-${tid}`);

  // Progress bar
  let progressDiv = createCustomElement('div', 'progress-div', `progress-div-${tid}`);
  progressDiv.innerHTML = `<label for="progress-bar">Progress:</label><progress id="progress-bar-${tid}" value="${(tid+1)/(N_TASK+1)*100}" max="100"></progress>`

  // Main task box
  let mainBoxDiv = createCustomElement('div', 'main-box', `main-box-${tid}`);

  let scoreWrapper = createCustomElement('div', 'score-wrapper', `score-wrapper-${tid}`);

  let feedbackBox =  createCustomElement('div', 'feedback-box', `feedback-box-${tid}`);
  feedbackBox.innerHTML = showFeedback(0)
  scoreWrapper.append(feedbackBox);

  let scoreBox = createCustomElement('div', 'score-box', `score-box-${tid}`);
  scoreBox.innerHTML = showScoreText(task_scores[tid-1]);
  scoreWrapper.append(scoreBox);

  mainBoxDiv.append(scoreWrapper)


  let itemsBox= createCustomElement('div', 'items-box', `items-box-${tid}`);
  let itemsTab = createCustomElement('table', 'worktop-table', id=`items-tab-${tid}`);

  // Draw grid
  for (let i = 0; i < NROW; i++) {
    let wtrows = itemsTab.insertRow();
    for (let j = 0; j < NCOL; j++) {
      let tcell = wtrows.insertCell();

      let tcellId = `task${tid}-grid-` + (j+1).toString() + '-' + (NROW-i).toString();
      tcell.id = tcellId;

      //tcell.style.border = 'red solid 1px';
      tcell.style.height = '60px';
      tcell.style.width = '60px';
      tcell.style.textAlign = 'center';
      tcell.style.verticalAlign = 'middle';

      if (Object.keys(task_cell_item).indexOf(tcellId) > -1 ) {
        //tcell.innerHTML = drawItem(task_cell_item[tcellId]);
        if (task_cell_item[tcellId] == 'circ') {
          tcell.append( drawCircle('brown'));
        } else if (task_cell_item[tcellId] == 'tria') {
          tcell.append(drawTriangle());
        } else if (task_cell_item[tcellId] == 'star') {
          tcell.append(drawStar('yellow'));
        }
        tcell.onclick = () => cellClick(tcellId);
      }

    }
  }
  itemsBox.append(itemsTab);
  mainBoxDiv.append(itemsBox);

  // Task button
  let buttonDiv = createCustomElement('div', 'button-group-vc', '');
  let taskBtn = createBtn(`task-confirm-${tid}`, 'Combine!', true, 'big-button');
  let taskNextBtn = createBtn(`task-next-${tid}`, 'Next', false, 'big-button');
  let taskFillerBtn = createBtn(`task-noshow-${tid}`, '', true, 'big-button');
  taskFillerBtn.style.opacity = 0;
  buttonDiv.append(taskFillerBtn);
  buttonDiv.append(taskBtn);
  buttonDiv.append(taskNextBtn);
  taskBtn.onclick = () => {
    let selectedItems = readTaskData(clickData, 'task'+tid, task_cell_item );
    let feedback = getTaskFeedbackChunk(selectedItems[0], CONFIGS);

    feedbackBox.innerHTML = showFeedback(feedback)
    task_scores[tid-1] += feedback;
    scoreBox.innerHTML = showScoreText(task_scores[tid-1]);

    taskNextBtn.disabled = false;
  }
  taskNextBtn.onclick = () => task_next(tid);

  // Assemble
  taskDiv.append(progressDiv);
  taskDiv.append(mainBoxDiv);
  taskDiv.append(buttonDiv);

  getEl('task').append(taskDiv);
  taskDiv.style.display = (tid==1)? 'block': 'none';

}
function task_next(id) {
  if (id < N_TASK) {
    hideAndShowNext(`task-${id}`, `task-${id+1}`, "block");
  } else {
    hideAndShowNext("task", "debrief", "block");
  }
}
function cellClick (cell_id) {
  clickData[cell_id] += 1;
  if (clickData[cell_id] % 2 == 1) {
    getEl(cell_id).style.border = 'solid red 2px';
  } else {
    getEl(cell_id).style.border = '0px';
  }
}


/* Comprehension quiz */
const checks = [ 'check1', 'check2', 'check3', 'check4', 'check5' ];
const answers = [ false, false, true, false, true ];

function check_quiz() {
  getEl('check-btn').style.display = 'none';

  let inputs = [];
  checks.map(check => {
    const vals = document.getElementsByName(check);
    inputs.push(vals[0].checked);
  });
  const pass = (inputs.join('') === answers.join(''));

  if (pass) {
    showNext('pass', 'block');
  } else {
    showNext('retry', 'block');
  }
}
function handle_pass() {
  start_task_time = Date.now();
  hide("pass");
  hide("quiz");
  showNext("task", "block");
}
function handle_retry() {
  hide("retry");
  hide("quiz");
  showNext("instruction", "block");
  getEl('check-btn').style.display = 'flex';
}
getEl('prequiz').onchange = () => compIsFilled() ? getEl('check-btn').disabled = false : null;



/* Bebrief */
getEl('postquiz').onchange = () => isFilled('postquiz')? getEl('done-btn').disabled = false: null;

function is_done(complete_code) {
  let inputs = getEl('postquiz').elements;
  Object.keys(inputs).forEach(id => subjectData[inputs[id].name] = inputs[id].value);

  // Clean up free responses
  subjectData['feedback'] = removeSpecial(subjectData['feedback']);

  const end_time = new Date();
  let token = generateToken(8);

  // Save data
  let clientData = {};
  clientData.subject = subjectData;
  clientData.subject.date = formatDates(end_time, 'date');
  clientData.subject.time = formatDates(end_time, 'time');
  clientData.subject.task_duration = end_time - start_task_time;
  clientData.subject.token = token;

  // Transit
  hideAndShowNext("debrief", "completed", 'block');
  getEl('completion-code').append(document.createTextNode(complete_code));

  // download(JSON.stringify(clientData), 'data.txt', '"text/csv"');
  console.log(clientData);
}
