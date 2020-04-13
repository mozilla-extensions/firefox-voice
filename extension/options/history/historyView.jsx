/* globals React */

/* eslint-disable no-unused-vars */
import { Database } from "../../history.js";

const { useState, useEffect } = React;

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
  }, [tableRows]);

  return <HistoryTable rows={tableRows} numRows={numRows}></HistoryTable>;
};

const HistoryTable = ({ rows, numRows }) => {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const tableFields = ["Date", "You said..."];
  const objectFields = ["timestamp", "utterance"];
  const possibleItemsPerPage = [10, 25, 50, 100];
  const tableColumns = tableFields.map(field => <th>{field}</th>);
  const tableRows = rows
    .map(row => {
      const tr = (
        <tr>
          {objectFields.map(key => {
            // format each row of data
            let element;
            switch (key) {
              case "timestamp": {
                element = (
                  <td>{new Date(parseInt(row[key], 10)).toLocaleString()}</td>
                );
                break;
              }
              default: {
                element = <td>{row[key]}</td>;
                break;
              }
            }
            return element;
          })}
        </tr>
      );
      return tr;
    })
    .slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const onClickPrevious = event => {
    if (page > 1) {
      // start page index at 1
      setPage(page - 1);
    }
  };
  const onClickNext = event => {
    const maxNumPages = Math.ceil(numRows / itemsPerPage);
    if (page < maxNumPages) {
      // prevent indexing past the last page
      setPage(page + 1);
    }
  };
  const onItemsPerPageChange = event => {
    // change the number of items displayed per page and switch to the first page
    setItemsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // calculate the values used to display: ${indexOfFirstItem}-${indexOfLastItem} of ${totalNumOfItems}
  const firstIndex = (page - 1) * itemsPerPage + 1;
  const secondIndex =
    numRows < page * itemsPerPage ? numRows : page * itemsPerPage;

  return (
    <div className="settings-content">
      <fieldset>
        <legend>
          View Your Voice History
          <button
            className="button"
            onClick={async () => {
              await Database.clearAll(DB_NAME, TABLE_NAME);
            }}
          >
            <img
              src="./images/delete.svg"
              alt="Clear all"
              className="clear-all"
            ></img>
          </button>
        </legend>
        <table className="history-table">
          <thead align="left">
            <tr>{tableColumns}</tr>
          </thead>
          <tbody>{tableRows}</tbody>
        </table>
        <div className="history-pagination">
          <label className="rows-indicator" htmlFor="rows">
            Rows per page:
          </label>
          <div className="select-wrapper rows-indicator">
            <select
              id="itemsPerPage"
              name="rows"
              value={itemsPerPage}
              onChange={onItemsPerPageChange}
            >
              {possibleItemsPerPage.map(value => (
                <option value={value}>{value}</option>
              ))}
            </select>
          </div>
          {numRows !== 0 ? (
            <span className="rows-indicator">
              <span>
                {firstIndex}-{secondIndex} of {numRows}
              </span>
            </span>
          ) : (
            <span className="rows-indicator">
              <span>0-0 of {numRows}</span>
            </span>
          )}
          <button className="button previous" onClick={onClickPrevious}>
            <img
              src="./images/back-12.svg"
              alt="Previous page"
              className="previous-page"
            ></img>
          </button>
          <button className="button next" onClick={onClickNext}>
            <img
              src="./images/back-12.svg"
              alt="Next page"
              className="next-page"
            ></img>
          </button>
        </div>
      </fieldset>
    </div>
  );
};
