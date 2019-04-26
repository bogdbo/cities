import * as React from 'react';
import papaparse from 'papaparse';
import styled from 'styled-components/macro';
import {RouteComponentProps} from "react-router";
import {Link} from "react-router-dom";

interface State {
  cities: ReadonlyArray<ReadonlyArray<string>>;
  error?: boolean;
}

interface Props {
}

type InternalProps = Props & RouteComponentProps<{}>;


class Cities extends React.Component<InternalProps, State> {
  private direction: number = 1;

  constructor(props: InternalProps) {
    super(props);
    this.state = {cities: []};
  }

  async componentDidMount(): Promise<void> {
    await this.tryLoadCities();
  }

  componentWillReceiveProps(nextProps: InternalProps): void {
    if (!this.state.cities) {
      return;
    }

    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.direction = 1;
    } else {
      this.direction = this.direction * -1;
    }
    this.sortCities(this.state.cities, nextProps.location.pathname, this.direction);
  }

  render(): JSX.Element {
    if (this.state.error) {
      return (<h1>could not load cities</h1>);
    }

    return (
      <Host>
        {this.state.cities.map((row, i) => <StyledRow key={i} isHeader={i === 0} row={row}/>)}
      </Host>);
  }

  tryLoadCities = async () => {
    const response = await fetch('/cities.csv');
    if (!response || !response.body) {
      this.setState({error: true});
      return;
    }

    const rawText = await response.text();
    const csvRows = papaparse.parse(rawText, {
      dynamicTyping: true,
      transform: (value: string): any => {
        return value.replace('\n', ' ').replace(',', '');
      }
    }).data;

    this.sortCities(csvRows, this.props.location.pathname)
  }

  sortCities = (cities: ReadonlyArray<ReadonlyArray<string>>, currentPath: string, direction: number = 1) => {
    if (!this.state.cities) {
      return;
    }

    // discard leading '/'
    const columnName = currentPath.substr(1);
    const cloneCities = cities.slice(0);
    const header = cloneCities.shift() as ReadonlyArray<string>;
    const columnIndex = Math.max(0, header.indexOf(columnName));

    cloneCities.sort((a: ReadonlyArray<string>, b: ReadonlyArray<string>) => {
      if (a[columnIndex] > b[columnIndex]) {
        return 1 * direction;
      } else if (a[columnIndex] < b[columnIndex]) {
        return -1 * direction;
      }
      return 0;
    });

    cloneCities.unshift(header);
    this.setState({cities: cloneCities});
  }
}


const Row: React.FC<{ row: ReadonlyArray<string>, className?: string, isHeader?: boolean }> = ({row, isHeader, className}) => {
  return (
    <div className={className}>
      {row.map((r, i) => {
        let key = r.toString() + i;
        if (isHeader) {
          return <Link key={key} to={i === 0 ? '/' : r}>{r}</Link>
        } else {
          return <div key={key}>{r}</div>
        }
      })}
    </div>
  );
};

const Host = styled.div`
  display: table;
  width: 100%;
  height: 100%;
`;


const StyledRow = styled(Row)`
  display: table-row;
  div, a {
    display: table-cell;
  }
`


export {Cities};