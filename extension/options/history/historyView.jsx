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
  const itemsPerPage = 50;
  const tableFields = ["You said...", "Date and time"];
  const objectFields = ["utterance", "timestamp"];
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
                  <td>
                    {new Date(parseInt(row[key], 10))
                      .toLocaleString()
                      .replace(/:\d+ /, " ")}
                  </td>
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

  return (
    <div className="settings-content">
      <fieldset>
        <legend>
          Voice History
          <button
            className="delete-button"
            onClick={async () => {
              await Database.clearAll(DB_NAME, TABLE_NAME);
            }}
          >
            Clear Voice History
          </button>
        </legend>
        <HistoryPagination
          numRows={numRows}
          page={page}
          setPage={setPage}
          itemsPerPage={itemsPerPage}
        />
        <table className="history-table">
          <thead align="left">
            <tr>{tableColumns}</tr>
          </thead>
          <tbody>{tableRows}</tbody>
        </table>
        <HistoryPagination
          numRows={numRows}
          page={page}
          setPage={setPage}
          itemsPerPage={itemsPerPage}
        />
      </fieldset>
    </div>
  );
};
const HistoryPagination = ({ numRows, page, setPage, itemsPerPage }) => {
  const onClickPrevious = () => {
    if (page > 1) {
      // start page index at 1
      setPage(page - 1);
    }
  };
  const onClickNext = () => {
    const maxNumPages = Math.ceil(numRows / itemsPerPage);
    if (page < maxNumPages) {
      // prevent indexing past the last page
      setPage(page + 1);
    }
  };

  // calculate the values used to display: ${indexOfFirstItem}-${indexOfLastItem} of ${totalNumOfItems}
  const firstIndex = (page - 1) * itemsPerPage + 1;
  const secondIndex =
    numRows < page * itemsPerPage ? numRows : page * itemsPerPage;

  return (
    <div className="history-pagination">
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
      <button
        className={firstIndex > 50 ? "active" : "inactive"}
        onClick={onClickPrevious}
      >
        <img src="./images/back-12.svg" alt="Previous page"></img>
      </button>
      <button
        className={secondIndex < numRows ? "next active" : "next inactive"}
        onClick={onClickNext}
      >
        <img
          src="./images/back-12.svg"
          alt="Next page"
          className="next-page"
        ></img>
      </button>
    </div>
  );
};
