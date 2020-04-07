const express = require('express');
const menuRouter = express.Router();
const menuItemsRouter = require('./menuitems');


const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuRouter.param('menuId', (req, res, next, menuId) => {
  db.get(`SELECT * FROM Menu WHERE Menu.id = ${menuId}`, (err, menu) => {
    if (err) {
      next(err);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.status(404).send();
    };
  });
});


menuRouter.use('/:menuId/menu-items', menuItemsRouter);


menuRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({menus: menus});
    };
  });
});

menuRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
    return res.status(400).send();
  };

  db.run(`INSERT INTO Menu (title) VALUES ('${title}')`, function(err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (err, menu) => {
        if (err) {
          next(err);
        } else {
          res.status(201).send({menu: menu});
        };
      });
    };
  });
});


menuRouter.get('/:menuId', (req, res, next) => {
  res.status(200).send({menu: req.menu});
});


menuRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
    return res.status(400).send();
  };

  db.run(`UPDATE Menu 
          SET title = '${title}' 
          WHERE Menu.id = ${req.params.menuId}`, 
          
          (err) => {
            if (err) {
              next(err);
            } else {
              db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (err, menu) => {
                if (err) {
                  next(err);
                } else {
                  res.status(200).send({menu: menu});
                };
              });
            };
  });


  menuRouter.delete('/:menuId', (req, res, next) => {
    db.get(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`, (err, menu) => {
      if (err) {
        next(err);
      } else if (menu) {
        return res.status(400).send();
      } else {
        db.run(`DELETE FROM Menu WHERE Menu.id = ${req.params.menuId}`, (err) => {
          if (err) {
            next(err);
          } else {
            res.status(204).send();
          };
        });
      };
    });
  });
  
});

module.exports = menuRouter;

