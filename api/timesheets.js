const express = require('express');
const timeSheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


timeSheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${timesheetId}`, (err, timesheet) => {
    if (err) {
      next(err);
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      res.status(404).send();
    };
  });
});


timeSheetsRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Timesheet WHERE Timesheet.employee_id = ${req.params.employeeId}`, (err, timesheets) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({timesheets: timesheets});
    };
  });
});


timeSheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;

  if (!hours || !rate || !date) {
    return res.status(400).send();
  };

  db.run(`INSERT INTO Timesheet
          (hours, rate, date, employee_id)
          VALUES ('${hours}', '${rate}', '${date}', '${employeeId}')`, 
          
          function(err) {
            if (err) {
              next(err);
            } else {
              db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, (err, timesheet) => {
                if (err) {
                  next(err);
                } else {
                  res.status(201).send({timesheet: timesheet});
                };
              });
            };
          });

});


timeSheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;

  if (!hours || !rate || !date) {
    return res.status(400).send();
  };

  db.run(`UPDATE Timesheet
          SET hours = '${hours}',
              rate = '${rate}',
              date = '${date}',
              employee_id = '${employeeId}'
          WHERE Timesheet.id = ${req.params.timesheetId}`,
          
          (err) => {
            if(err) {
              next(err);
            } else {
              db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, (err, timesheet) => {
                if(err) {
                  next(err);
                } else {
                  res.status(200).send({timesheet: timesheet});
                };
              });
            };
          });
});


timeSheetsRouter.delete('/:timesheetId', (req, res, next) => {
  db.run(`DELETE FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, (err) => {
    if (err) {
      next(err);
    } else {
      res.status(204).send();
    }
  });
});


module.exports = timeSheetsRouter;