const Koa = require("koa");
const cors = require('@koa/cors');
const Router = require("@koa/router");
const koaBody = require("koa-body")
const uuid = require("uuid");
const fs = require('fs');
const path = require('path');

const app = new Koa();
const router = new Router();
const tasksFilePath = path.join(__dirname, 'tasks.json');
const port = 3031;
let pullTask = [];
const saveTasksToFile = () => {
  fs.writeFileSync(tasksFilePath, JSON.stringify(pullTask), 'utf8');
}

app.use(
  koaBody({
    urlencoded: true,
    multipart: true,
    json: true,
  })
);

app.use(cors());

app.use(router.routes()).use(router.allowedMethods());

app.use((ctx, next) => {
  if (ctx.request.method !== 'OPTIONS') {
    next();
    return;
  }
  ctx.response.set("Access-Control-Allow-Origin", "*");
  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');
  ctx.response.status = 204;
  next();
});

router.get('/allTickets', ctx => {
  try {
    pullTask = JSON.parse(fs.readFileSync(tasksFilePath, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log('Предыдущие тикеты не найдены, начинаем с пустого списка.');
    } else {
      throw e;
    }
  }
  ctx.response.body = pullTask;
});

router.post('/newTicket', ctx => {
  const {name, description, created} = ctx.request.body;
  const status = false;
  const id = uuid.v4();
  pullTask.push({ id, name, status, description, created });

  saveTasksToFile();
  ctx.response.body = id;
});

router.delete('/tickets/:id', ctx => {
  const { id } = ctx.params;
  if (pullTask.every(sub => sub.id !== id)) {
    ctx.response.body = "This ticket doesn't exists";
    ctx.response.status = 410;
  }
  pullTask = pullTask.filter((sub) => sub.id !== id);

  saveTasksToFile();
  ctx.response.body = "Ticket is deleted";
});

router.patch('/', ctx => {
  const id = ctx.request.query.id;
  const status = ctx.request.query.status === 'true';
  const index = pullTask.findIndex(el => el.id === id);
  pullTask[index].status = status;
  
  saveTasksToFile(); 
  ctx.response.body = "Ticket status updated";
});

router.put('/updateTicket/:id', ctx => {
  const { id } = ctx.params;
  const { name, description} = ctx.request.body;

  const index = pullTask.findIndex(el => el.id === id);
  if (index !== -1) {
    pullTask[index].name = name;
    pullTask[index].description = description;
    
    saveTasksToFile();
    ctx.response.body = "Ticket is updated";
    ctx.response.status = 200;
  } else {
    ctx.response.body = "Ticket not found";
    ctx.response.status = 404;
  }
});

app.listen(port);
