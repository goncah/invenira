import React, { ChangeEvent, useState } from 'react';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Table, TableSortLabel } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

export interface FilterableTableColumn<T> {
  id: keyof T;
  name: string;
}

export interface FilterableTableRow<T> {
  row: T;
  actions: React.ReactElement[];
}

export interface FilterableTableProps<T> {
  columns: FilterableTableColumn<T>[];
  sortBy: keyof T;
  rows: FilterableTableRow<T>[];
}

export function FilterableTable<T>(props: FilterableTableProps<T>) {
  const [filter, setFilter] = useState('');
  const [orderBy, setOrderBy] = useState<keyof T>(props.sortBy);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: keyof T) => {
    const isAsc = orderBy === column && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(column);
  };

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value.toLowerCase());
  };

  const filteredData = props.rows.filter((row) => {
    for (const k in row.row) {
      if (
        (row.row[k] as unknown as string)
          .toString()
          .toLowerCase()
          .includes(filter)
      )
        return true;
    }
    return false;
  });

  const sortedData = filteredData.sort((a, b) => {
    const isAsc = order === 'asc';
    if (a.row[orderBy] < b.row[orderBy]) return isAsc ? -1 : 1;
    if (a.row[orderBy] > b.row[orderBy]) return isAsc ? 1 : -1;
    return 0;
  });

  return (
    <>
      <TextField
        label="Filter"
        variant="outlined"
        margin="normal"
        onChange={handleFilterChange}
        placeholder="Search by any field"
      />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {props.columns.map((column) => (
                <TableCell key={column.id as string}>
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={order}
                    onClick={() => handleSort(column.id)}
                  >
                    {column.name}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {props.columns.map((column) => (
                  <TableCell key={column.id as string}>
                    {row.row[column.id] !== undefined
                      ? row.row[column.id] instanceof Date
                        ? (row.row[column.id] as Date).toLocaleString(
                            Intl.NumberFormat().resolvedOptions().locale,
                          )
                        : (row.row[column.id] as string)
                      : '-'}
                  </TableCell>
                ))}
                <TableCell>{row.actions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
