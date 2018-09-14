var express = require('express');
var router = express.Router();

var fs = require('fs')
var multer = require('multer')

const EmployeeBase = require('../models/employeeBase');

// // 使用硬盘存储模式设置存放接收到的文件的路径以及文件名
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 接收到文件后输出的保存路径（若不存在则需要创建）
    cb(null, 'upload/');
  },
  filename: function (req, file, cb) {
    // 将保存文件名设置为 时间戳 + 文件原始名，比如 151342376785-123.jpg
    cb(null, req.body.idNum + '-' + file.originalname);
  }
});

// 创建文件夹
var createFolder = function (folder) {
  try {
    // 测试 path 指定的文件或目录的用户权限,我们用来检测文件是否存在
    // 如果文件路径不存在将会抛出错误"no such file or directory"
    fs.accessSync(folder);
  } catch (e) {
    // 文件夹不存在，以同步的方式创建文件目录。
    fs.mkdirSync(folder);
  }
};

var uploadFolder = './upload/';
createFolder(uploadFolder);
// 创建 multer 对象
var upload = multer({ storage: storage });


const getBaseInfo = (queryResult) => {
  const baseTitle = ['name', 'sex', 'birthday', 'phone', 'hometown', 'education', 'major', 'politicalStatus', 'department', 'job', 'startwork', 'id'];
  const finalResult = []
  queryResult.forEach((item, index) => {
    finalResult[index] = {}
    baseTitle.forEach(title => {
      finalResult[index][title] = item.get(title)
    })
  })
  return finalResult
}

const basePostFunc = async (req, res, next) => {
  // const {name, sex, birthday, hometown, education, major, idNum, phone, politicalStatus, department, job} = req.body;
  if (req.session.user) {
    // 未登录
    res.send({
      code: 0,
      state: 'fail'
    })
    return
  } else {
    console.log("rrrrrrrrrrrrrrrrrrrr", req.body)
    const opts = {}
    opts.where = req.body.where;
    const current = req.body.current
    const pageSize = req.body.pageSize
    opts.offset = (current - 1) * pageSize
    opts.limit = pageSize
    const queryResult = await EmployeeBase.findAndCountAll(opts)
    const total = queryResult.count
    const currentPageEmployee = getBaseInfo(queryResult.rows)
    res.send({
      code: 1,
      state: 'success',
      employee: currentPageEmployee,
      total
    })
  }

  // const result = EmployeeBase.findAll(opts)
}

const getDetailFunc = async (req, res, next) => {
  console.log(req.query.id)
  res.render('employee', { id: req.query.id });
  // res.send('hello world')
  // if (req.session.user) {
  //   // 未登录
  //   res.send({
  //     code: 0,
  //     state: 'fail'
  //   })
  //   return
  // } else {
  //   console.log("rrrrrrrrrrrrrrrrrrrr", req.body)
  //   const opts = {}
  //   opts.where = req.body.where;
  //   const current = req.body.current
  //   const pageSize = req.body.pageSize
  //   opts.offset = (current - 1) * pageSize
  //   opts.limit = pageSize
  //   const queryResult = await EmployeeBase.findAndCountAll(opts)
  //   const total = queryResult.count
  //   const currentPageEmployee = getBaseInfo(queryResult.rows)
  //   res.send({
  //     code: 1,
  //     state: 'success',
  //     employee: currentPageEmployee,
  //     total
  //   })
  // }
}

const addEmployeeFunc = (req, res, next) => {
  res.render('employee', { id: 1 });
}

const postEmployeeFunc = (req, res, next) => {
  var name = req.body.name
  console.log(req.body)
  var file = req.file;
  console.log(file)
  console.log('文件类型：%s', file.mimetype);
  console.log('原始文件名：%s', file.originalname);
  console.log('文件大小：%s', file.size);
  console.log('文件保存路径：%s', file.path);
  // 接收文件成功后返回数据给前端
  res.json({ res_code: '0' });
}

router.post('/base', basePostFunc);
router.get('/detail', getDetailFunc);
router.get('/addpage', addEmployeeFunc);
router.post('/save', upload.single('portrait'), postEmployeeFunc)
module.exports = router;