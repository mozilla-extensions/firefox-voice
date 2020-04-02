import { Database } from "./../../history.js";

const { useState } = React;

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
  const tableColumns = tableFields.map(field => <th>{field}</th>);

  const onClickPrevious = (event) => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  const onClickNext = (event) => {
    const maxNumPages = (numRows / itemsPerPage) + Math.ceil(numRows % itemsPerPage / 10) ;
    if (page < maxNumPages) {
      setPage(page + 1);
    }
  };
  const onItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
  };

  (async () => {
    const rows = await Database.getAll(DB_NAME, TABLE_NAME, undefined);
    setNumRows(rows.length);
    setTableRows(
      rows
        .map(row => {
          const tr = <tr>
            {objectFields.map(key => {
              let element;
              switch (key) {
                case 'timestamp': {
                  element = <td>{new Date(parseInt(row[key], 10)).toLocaleString()}</td>;
                  break;
                }
                default: {
                  element = <td>{row[key]}</td>;
                  break;
                }
              }
              return element;
            })}
          </tr>;
          return tr;
        })
        .slice((page - 1) * itemsPerPage, (page * itemsPerPage)-1)
    );
  })();

  return (
    <div className="settings-content">
      <fieldset>
        <legend>View your Voice History</legend>
        <table className="history-table">
          <thead align="left">
            <tr>
              {tableColumns}
            </tr>
          </thead>
          <tbody>
            {tableRows}
          </tbody>
        </table>
        <div className="history-pagination">
          <label id="rows-indicator" for="rows">Rows per page:</label>
          <select
            id="rows"
            value={itemsPerPage}
            onChange={() => onItemsPerPageChange}
          >
            {possibleItemsPerPage.map(value =>
              <option value={value}>{value}</option>
            )}
          </select>
          <button className="previous" onClick={() => onClickPrevious}>&lt;</button>
          <button className="next" onClick={() => onClickNext}>></button>
          </div>
      </fieldset>
    </div>
  );
};