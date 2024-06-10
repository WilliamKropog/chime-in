import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';

@Pipe({
    name: 'relativeTime'
})
export class RelativeTimePipe implements PipeTransform {

    transform(value: any): string {
        if (value instanceof Date) {
            return formatDistanceToNow(value, { addSuffix: true });
        } else if (value?.seconds) {
            return formatDistanceToNow(new Date(value.seconds * 1000), { addSuffix: true });
        }
        return '';
    }
}
