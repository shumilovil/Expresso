const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${menuItemId}`, (err, menuItem) => {
    if (err) {
      next(err);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();      
    } else {
      res.status(404).send();
    };
  });
});


menuItemsRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`, (err, menuItems) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({menuItems: menuItems});
    };
  });
});


menuItemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;

  if (!name || !description || !inventory || !price) {
    return res.status(400).send();
  };

  db.run(`INSERT INTO MenuItem
          (name, description, inventory, price, menu_id)
          VALUES ('${name}', '${description}', '${inventory}', '${price}', '${menuId}')`,
          
          function(err) {
            if (err) {
              next(err);
            } else {
              db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (err, menuItem) => {
                if (err) {
                  next(err);
                } else {
                  res.status(201).send({menuItem: menuItem});
                };
              });
            };
          });
});


menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;

  if (!name || !description || !inventory || !price) {
    return res.status(400).send();
  };

  db.run(`UPDATE MenuItem
          SET name = '${name}',
              description = '${description}',
              inventory = '${inventory}',
              price = '${price}',
              menu_id = '${menuId}'
          WHERE MenuItem.id = ${req.params.menuItemId}`, 
          
          (err) => {
            if (err) {
              next(err);
            } else {
              db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, (err, menuItem) => {
                if (err) {
                  next(err);
                } else {
                  res.status(200).send({menuItem: menuItem});
                };
              });
            };
          });
});


menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.run(`DELETE FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, (err) => {
    res.status(204).send();
  });
});


module.exports = menuItemsRouter;