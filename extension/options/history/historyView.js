import { Database } from "./../../history.js";
const {
  useState
} = React;
export const History = () => {
  // TODO: check and add useState docs e.g. Rules on Hooks
  // useState returns an array of 2, use array destructuring to simplify code
  const [tableRows, setTableRows] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [numRows, setNumRows] = useState(0);
  const DB_NAME = 'voice';
  const TABLE_NAME = 'utterance';
  const tableFields = ['Date', 'Utterance'];
  const objectFields = ['timestamp', 'utterance'];
  const possibleItemsPerPage = [10, 25, 50, 100];
  const tableColumns = tableFields.map(field => React.createElement("th", null, field));

  const onClickPrevious = event => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const onClickNext = event => {
    const maxNumPages = numRows / itemsPerPage + Math.ceil(numRows % itemsPerPage / 10);

    if (page < maxNumPages) {
      setPage(page + 1);
    }
  };

  const onItemsPerPageChange = event => {
    setItemsPerPage(event.target.value);
  };

  (async () => {
    const rows = await Database.getAll(DB_NAME, TABLE_NAME, undefined);
    setNumRows(rows.length);
    setTableRows(rows.map(row => {
      const tr = React.createElement("tr", null, objectFields.map(key => {
        let element;

        switch (key) {
          case 'timestamp':
            {
              element = React.createElement("td", null, new Date(parseInt(row[key], 10)).toLocaleString());
              break;
            }

          default:
            {
              element = React.createElement("td", null, row[key]);
              break;
            }
        }

        return element;
      }));
      return tr;
    }).slice((page - 1) * itemsPerPage, page * itemsPerPage - 1));
  })();

  return React.createElement("div", {
    className: "settings-content"
  }, React.createElement("fieldset", null, React.createElement("legend", null, "View your Voice History"), React.createElement("table", {
    className: "history-table"
  }, React.createElement("thead", {
    align: "left"
  }, React.createElement("tr", null, tableColumns)), React.createElement("tbody", null, tableRows)), React.createElement("div", {
    className: "history-pagination"
  }, React.createElement("label", {
    id: "rows-indicator",
    for: "rows"
  }, "Rows per page:"), React.createElement("select", {
    id: "rows",
    value: itemsPerPage,
    onChange: () => onItemsPerPageChange
  }, possibleItemsPerPage.map(value => React.createElement("option", {
    value: value
  }, value))), React.createElement("button", {
    className: "previous",
    onClick: () => onClickPrevious
  }, "<"), React.createElement("button", {
    className: "next",
    onClick: () => onClickNext
  }, ">"))));
};