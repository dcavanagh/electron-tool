import {Injectable} from '@nestjs/common';
import {DataPoints} from './interfaces';

@Injectable()
export class DataService {
  private dataPoints: Array<DataPoints> = [];

  public async addDataPoints(points: DataPoints): Promise<void> {
    this.dataPoints.push(points);

    const table = document.getElementById('data');

    if (table) {
      let tableHtml = '';
      const headerRow = '<tr><td>TIMESTAMP</td>';
      this.dataPoints.forEach(dataPoint => {
        tableHtml += `<td>${ dataPoint.timestamp }</td>`;
        Object.keys(dataPoint.data).forEach(value => {
          tableHtml += `<td>${ dataPoint.data[value] }</td>`;
        });
        tableHtml += '</tr>';
      });

      table.innerHTML = headerRow + tableHtml;
    }
  }
}
