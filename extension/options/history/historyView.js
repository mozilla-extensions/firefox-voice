import { Database } from "./../../history.js";
const {
  useState,
  useEffect
} = React;
const DB_NAME = "voice";
const TABLE_NAME = "utterance";
export const History = () => {
  const [tableRows, setTableRows] = useState([]);
  const [numRows, setNumRows] = useState(0);
  useEffect(() => {
    const getRows = async () => {
      const rows = await Database.getAll(DB_NAME, TABLE_NAME, undefined);
      setTableRows(rows);
      setNumRows(rows.length);
    };

    getRows();
  }, []);
  return React.createElement(HistoryTable, {
    rows: tableRows,
    numRows: numRows
  });
};

const HistoryTable = ({
  rows,
  numRows
}) => {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const tableFields = ["Date", "Utterance"];
  const objectFields = ["timestamp", "utterance"];
  const possibleItemsPerPage = [10, 25, 50, 100];
  const tableColumns = tableFields.map(field => React.createElement("th", null, field));
  const tableRows = rows.map(row => {
    const tr = React.createElement("tr", null, objectFields.map(key => {
      let element;

      switch (key) {
        case "timestamp":
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
  }).slice((page - 1) * itemsPerPage, page * itemsPerPage - 1);

  const onClickPrevious = event => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const onClickNext = event => {
    const maxNumPages = Math.ceil(numRows / itemsPerPage);

    if (page < maxNumPages) {
      setPage(page + 1);
    }
  };

  const onItemsPerPageChange = event => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const firstIndex = (page - 1) * itemsPerPage + 1;
  const secondIndex = numRows < (page - 1) * itemsPerPage + 1 + itemsPerPage ? numRows : (page - 1) * itemsPerPage + 1 + itemsPerPage;
  return React.createElement("div", {
    className: "settings-content"
  }, React.createElement("fieldset", null, React.createElement("legend", null, "View your Voice History"), React.createElement("table", {
    className: "history-table"
  }, React.createElement("thead", {
    align: "left"
  }, React.createElement("tr", null, tableColumns)), React.createElement("tbody", null, tableRows)), React.createElement("div", {
    className: "history-pagination"
  }, React.createElement("label", {
    className: "rows-indicator",
    for: "rows"
  }, "Rows per page:"), React.createElement("div", {
    className: "select-wrapper rows-indicator"
  }, React.createElement("select", {
    id: "itemsPerPage",
    value: itemsPerPage,
    onChange: onItemsPerPageChange
  }, possibleItemsPerPage.map(value => React.createElement("option", {
    value: value
  }, value)))), numRows !== 0 ? React.createElement("span", {
    className: "rows-indicator"
  }, React.createElement("span", null, firstIndex, "-", secondIndex, " of ", numRows)) : React.createElement("span", {
    className: "rows-indicator"
  }, React.createElement("span", null, "0-0 of ", numRows)), React.createElement("button", {
    className: "previous",
    onClick: onClickPrevious
  }, "<"), React.createElement("button", {
    className: "next",
    onClick: onClickNext
  }, ">"))));
};