const http = require("http");
const Koa = require("koa");
const koaBody = require("koa-body")
const uuid = require("uuid");

const app = new Koa();
let pullTask = [];
const port = 3031;

app.use(
  koaBody({
    urlencoded: true,
    multipart: true,
  })
);

// Разрешение на использрвание REST
app.use((ctx, next) => {
  if (ctx.request.method !== 'OPTIONS') {
    next();
    return
  }
  ctx.response.set("Access-Control-Allow-Origin", "*"); //это заголовок ответа, который позволяет веб-страницам получить доступ к ресурсам другого домена
  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST'); //это заголовок ответа, который позволяет использовать разрешенные методы
  ctx.response.status = 204;
  next();
});


// Добавляем тикет
app.use((ctx, next) => {
  ctx.response.set("Access-Control-Allow-Origin", "*");
  
  if (ctx.request.method === 'POST') {
    const {name, description, created} = ctx.request.body;
  const status = false;
  const id = uuid.v4();
 

  pullTask.push({ id, name, status, description, created });

  console.log("pullTask - Submit");
  console.log(pullTask);

  ctx.response.body = id;

  next();
  } else {
    next();
    return
  }
  
  
});

// Удаляем тикет
app.use((ctx, next) => {
  ctx.response.set("Access-Control-Allow-Origin", "*");
  if (ctx.request.method === 'DELETE') {

    console.log('DELETE');

   const { id } = ctx.request.query;
  
    if (pullTask.every(sub => sub.id !== id)) {
      ctx.response.body = "This tikket dosen't exists";
      ctx.response.status = 410;
      next();
      return;
    }
    pullTask = pullTask.filter((sub) => sub.id !== id);
  
  
    console.log("pullTask - delete");
    console.log(pullTask);
    
    ctx.response.body = "Ticket is deleted";
    next();
  } else {
    next();
    return
  }
});

// Чекбоксим
app.use((ctx, next) => {
  ctx.response.set("Access-Control-Allow-Origin", "*");
  if (ctx.request.method === 'PATCH') {

    console.log('PATCH');

   const { id,  status} = ctx.request.query;

   console.log(ctx.request.query);

  const ind = pullTask.findIndex(el => el.id === id)
   pullTask[ind].status = status;


    console.log("pullTask - PATCHED");
    console.log(pullTask);
    
    ctx.response.body = "Ticket is patched";
    next();
  } else {
    next();
    return
  }
});

// Изменение информации
app.use((ctx, next) => {
  ctx.response.set("Access-Control-Allow-Origin", "*");
  if (ctx.request.method === 'PUT') {

    console.log('PUT');

   const { id,  name, description} = ctx.request.query;

   console.log(ctx.request.query);

  const ind = pullTask.findIndex(el => el.id === id)
   pullTask[ind].name = name;
   pullTask[ind].description = description;

    console.log("pullTask - PUT");
    console.log(pullTask);
    
    ctx.response.body = "Ticket is patched";
    next();
  } else {
    next();
    return
  }
});



const server = http.createServer(app.callback());
server.listen(port, (error) => {
  if (error) {
    console.log(error);
    return;
  }
  console.log(`Server has started in port: ${port}`);
});