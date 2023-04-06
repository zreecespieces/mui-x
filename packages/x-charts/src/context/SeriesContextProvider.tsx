import * as React from 'react';
import barSeriesFormatter from '../BarChart/formatter';
import scatterSeriesFormatter from '../ScatterChart/formatter';
import lineSeriesFormatter from '../LineChart/formatter';
import { AllSeriesType } from '../models/seriesType';
import { defaultizeColor } from '../internals/defaultizeColor';

export type SeriesContextProviderProps = {
  series: AllSeriesType[];
  colors?: string[];
  children: React.ReactNode;
};

export type FormattedSeries = {
  bar?: ReturnType<typeof barSeriesFormatter>;
  scatter?: ReturnType<typeof scatterSeriesFormatter>;
  line?: ReturnType<typeof lineSeriesFormatter>;
  pie?: any;
};

export const SeriesContext = React.createContext<FormattedSeries>({});

const seriesTypeFormatter: { [type in AllSeriesType['type']]?: (series: any) => any } = {
  bar: barSeriesFormatter,
  scatter: scatterSeriesFormatter,
  line: lineSeriesFormatter,
  pie: (...arg) => {
    return arg;
  },
};

const formatSeries = (series: AllSeriesType[], colors?: string[]) => {
  // Group series by type
  const formattedSeries: FormattedSeries = {};
  series.forEach((seriesData, seriesIndex: number) => {
    const { id, type } = seriesData;

    if (formattedSeries[type] === undefined) {
      formattedSeries[type] = { series: {}, seriesOrder: [] };
    }
    if (formattedSeries[type]?.[id] !== undefined) {
      throw new Error(`MUI: series' id "${id}" is not unique`);
    }
    formattedSeries[type].series[id] = defaultizeColor(seriesData, seriesIndex, colors);
    formattedSeries[type].seriesOrder.push(id);
  });

  // Apply formater on a type group
  (Object.keys(seriesTypeFormatter) as AllSeriesType['type'][]).forEach((type) => {
    if (formattedSeries[type] !== undefined) {
      formattedSeries[type] =
        seriesTypeFormatter[type]?.(formattedSeries[type]) ?? formattedSeries[type];
    }
  });

  return formattedSeries;
};

export function SeriesContextProvider({ series, colors, children }: SeriesContextProviderProps) {
  const formattedSeries = React.useMemo(() => formatSeries(series, colors), [series, colors]);

  return <SeriesContext.Provider value={formattedSeries}>{children}</SeriesContext.Provider>;
}