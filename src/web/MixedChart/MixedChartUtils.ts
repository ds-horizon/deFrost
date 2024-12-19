import Papa from 'papaparse';
import {
  removeDefrost,
  removeDefrostFromList,
  type CsvDataType,
  type LogEvent,
  type LogItem,
  type ReactEventType,
  type ReactItemType,
} from '../utils';
export const CSV_TEXT = 'data/data.csv';
const CHANGES_TXT = 'data/reactCommits.txt';
const LOGS_TXT = 'data/userLogs.txt';
export const fetchFromFile = (fileUrl: string) => {
  return new Promise<string>((res, rej) => {
    fetch(fileUrl)
      .then((res) => res.text())
      .then((text) => {
        res(text);
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

export const formatDataForGraph = ({
  csvData,
  reactEvents,
  logtEvents,
}: {
  csvData: CsvDataType[];
  reactEvents: ReactEventType[];
  logtEvents: LogEvent[];
}) => {
  let allData: Record<string, string[]> = {};
  let reactData: ReactItemType[] = [];
  let indexReact = 0;
  let logData: LogItem[] = [];
  let indexLog = 0;
  const labels: string[] = [];
  let maxSum = 0;
  const csvSortedData = csvData.sort((a, b) => +a.timestamp - +b.timestamp);

  csvSortedData.forEach((element, index) => {
    const elementKeys = Object.keys(element);
    let sum = 0;
    elementKeys.forEach((eleKeyTemp) => {
      const eleKey = eleKeyTemp as keyof typeof element;
      if (eleKey === 'timestamp') return;
      if (eleKey in allData) {
        allData[eleKey]?.push(element[eleKey]);
      } else {
        allData[eleKey] = [];
        allData[eleKey].push(element[eleKey]);
      }
      sum = sum + +element[eleKey];
    });

    while (
      reactEvents.length > 0 &&
      indexReact < reactEvents.length &&
      element.timestamp > (reactEvents?.[indexReact]?.timestamp || 0)
    ) {
      reactData.push({
        x: `${index}`,
        y: 200,
        label: `${removeDefrost(reactEvents[indexReact]?.event.change?.name || '')}`,
        data: removeDefrostFromList(reactEvents[indexReact]?.event.list),
      });
      indexReact++;
    }

    while (
      logtEvents.length > 0 &&
      indexLog < logtEvents.length &&
      element.timestamp > (logtEvents?.[indexLog]?.timestamp || 0)
    ) {
      logData.push({
        x: `${index}`,
        y: 300,
        label: logtEvents[indexLog]?.event || '',
        data: logtEvents[indexLog]?.event || '',
      });
      indexLog++;
    }

    if (maxSum < sum) maxSum = sum;
    labels.push(`${index}`);
  });
  return { allData, labels, reactData, logData };
};
