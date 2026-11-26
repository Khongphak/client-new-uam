import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { TableModule } from 'primeng/table';

import { URow, UStatus } from '../../shared/ui';
import { createTableView, UTableFooter, UTableToolbar } from '../../shared/table';
import { initials, userFilters, UserRow } from './list-rows';
import { USER_VIEW_LINK } from './links';

/** Users tab: search + Department / UAM role / Status filters, table on desktop, tappable list on phone. */
@Component({
  selector: 'app-users-table',
  imports: [Avatar, RouterLink, TableModule, URow, UStatus, UTableFooter, UTableToolbar],
  templateUrl: './users-table.html',
  styleUrl: './list-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTable {
  readonly rows = input.required<readonly UserRow[]>();

  // Filter options come from the loaded rows, so the view is rebuilt when the rows are reloaded.
  protected readonly view = computed(() => {
    const rows = this.rows();
    return createTableView<UserRow>({
      rows: signal(rows),
      searchText: (row) => [row.name, row.username, row.email],
      filters: userFilters(rows),
    });
  });

  protected readonly initials = initials;
  protected readonly viewLink = USER_VIEW_LINK;
}
