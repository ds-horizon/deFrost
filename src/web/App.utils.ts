import Papa from 'papaparse';
import type { ComponentEvent } from './App.interface';

export const CSV_TEXT = 'data/data.csv';
const CHANGES_TXT = 'data/reactCommits.txt';
const LOGS_TXT = 'data/userLogs.txt';
export const fetchFromFile = (fileUrl: string) => {
  return new Promise<string>((res, rej) => {
    fetch(fileUrl)
      .then((resLocal) => resLocal.text())
      .then((text) => {
        const errorText = `<pre>Cannot GET /${fileUrl}</pre>`;
        if (text.includes(errorText)) {
          console.error('File Not Found');
        } else {
          res(text);
        }
      })
      .catch((error) => {
        rej(error);
      });
  });
};

export const fetchFromCsv = <T>(csvUrl: string) => {
  return new Promise<T[]>((res, _) => {
    fetchFromFile(csvUrl).then((text: string) => {
      Papa.parse(text, {
        header: true,
        complete: (result: Papa.ParseResult<T>) => {
          res(result.data);
        },
      });
    });
  });
};

export const getReactChangesTextFile = <T>() => {
  return new Promise<T>((res, _) => {
    fetchFromFile(CHANGES_TXT).then((textRes) => {
      const allEventString = textRes.split('---------------------');
      const allEvents = allEventString.map((event) => {
        const [timestamp, eventString] = event.split('$$$');
        return {
          timestamp: timestamp?.replaceAll(' ', '').replaceAll('\n', ''),
          event: JSON.parse(eventString ?? '{}'),
        };
      });
      res(allEvents as T);
    });
  });
};

export const getLogsTextFile = <T>() => {
  return new Promise<T>((res, _) => {
    fetchFromFile(LOGS_TXT).then((textRes) => {
      const allEventString = textRes.replaceAll(' ', '').trim().split('\n');
      const allEvents = allEventString.map((event) => {
        const [eventString, timestamp] = event.split(',');
        return {
          timestamp: timestamp?.replaceAll(' ', '').replaceAll('\n', ''),
          event: eventString?.replaceAll(' ', '').replaceAll('\n', ''),
        };
      });
      res(allEvents as T);
    });
  });
};

export const removeDefrost = (componentName?: string) => {
  if (componentName?.includes('Defrost')) {
    const newName = componentName.split('Defrost')[0];
    return `memo(${newName})`;
  } else {
    return componentName;
  }
};

export const removeDefrostFromList = (list?: ComponentEvent[]) => {
  const res: ComponentEvent[] = [];
  list?.forEach((item) => {
    res.push({ ...item, componentName: removeDefrost(item.componentName) });
  });
  return res;
};
