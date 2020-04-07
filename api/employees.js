const express = require('express');
const employeesRouter = express.Router();

const timeSheetsRouter = require('./timesheets')

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  db.get(`SELECT * FROM Employee WHERE Employee.id = ${employeeId}`, (err, employee) => {
    if (err) {
      next(err);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.status(404).send();
    };
  });
});


employeesRouter.use('/:employeeId/timesheets', timeSheetsRouter);


employeesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Employee WHERE Employee.is_current_employee = 1`, (err, employees) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({employees: employees});
    };
  });
});


employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;

  if (!name || !position || !wage) {
    return res.status(400).send();
  };

  db.run(`INSERT INTO Employee
          (name, position, wage)
          VALUES ('${name}', '${position}', '${wage}')`, 
          
          function(err) {
            if (err) {
              next(err);
            } else {
              db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (err, employee) => {
                if (err) {
                  next(err);
                } else {
                  res.status(201).send({employee: employee});
                };
              });
            };
          });
  
});


employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).send({employee: req.employee});
});


employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

  if (!name || !position || !wage) {
    return res.status(400).send();
  };

  db.run(`UPDATE Employee
          SET name = '${name}',
              position = '${position}',
              wage = '${wage}',
              is_current_employee = '${isCurrentEmployee}'
          WHERE Employee.id = ${req.params.employeeId}`,

            (err) => {
              if (err) {
                next(err);
              } else {
                db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
                  if (err) {
                    next(err);
                  } else {
                    res.status(200).send({employee: employee});
                  };
                });
              };
            });
});


employeesRouter.delete('/:employeeId', (req, res, next) => {
  db.run(`UPDATE Employee
          SET is_current_employee = 0
          WHERE Employee.id = ${req.params.employeeId}`, 
          
          (err) => {
            if (err) {
              next(err);
            } else {
              db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
                if (err) {
                  next(err);
                } else {
                  res.status(200).send({employee: employee});
                };              
              });
            };
          });
});


module.exports = employeesRouter;