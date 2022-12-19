/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , EmployeeProvider = require('./employeeprovider').EmployeeProvider;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.enable('trust proxy');
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var employeeProvider= new EmployeeProvider();

//Routes

//index
app.get('/', function(req, res){
  employeeProvider.findAll(function(error, emps){
      res.render('index', {
            title: 'Employees',
            employees:emps
        });
  });
});

//get available jobs
app.get('/jobs/available', function(req, res) {
    employeeProvider.findAll(function(error, result) {
      if(error) {
        res.redirect('/')
      }
      if(result) {
        const availableJobs = result.filter((job) => job.status === 'open')
        res.render('jobs', {availableJobs});
      }
    });
});

//save new job
app.post('/job/new', function(req, res){
    employeeProvider.save({
      projectName: req.param('projectName'),
      clientName: req.param('clientName'),
      technologies: req.param('technologies'),
      role: req.param('role'),
      jobDescription: req.param('jobDescription'),
      status: req.param('status'),
      interestedInUserId: []
    }, function( error, docs) {
        res.redirect('/')
    });
});

//save updated job status
app.post('/job/:id/status', function(req, res) {
	employeeProvider.update(req.params.id,{
    status: req.param('status')
	}, function(error, docs) {
		res.redirect('/')
	});
});

//update job interestedIn
app.post('/job/:id/interestedIn', function(req, res) {
  employeeProvider.findById(req.params.id, function(error, result) {
    if(error) res.redirect('/')
    if(result) {
      employeeProvider.update(req.params.id,{
        interestedInUserId: result.interestedInUserId.push(req.param('userId'))
      }, function(error, docs) {
        res.redirect('/')
      });
    }
  })
	
});

//delete a job
app.get('/job/:id/delete', function(req, res) {
	employeeProvider.delete(req.params.id, function(error, docs) {
		res.redirect('/')
	});
});

app.listen(process.env.PORT || 3000);
