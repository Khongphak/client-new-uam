import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';

import { URow, UStatus } from '../../shared/ui';
import { createTableView, UTableFooter, UTableToolbar } from '../../shared/table';
import { roleFilters, RoleRow } from './list-rows';
import { ROLE_VIEW_LINK } from './links';

/** Roles tab: search + System / Status filters, table on desktop, tappable list on phone. */
@Component({
  selector: 'app-roles-table',
  imports: [RouterLink, TableModule, URow, UStatus, UTableFooter, UTableToolbar],
  templateUrl: './roles-table.html',
  styleUrl: './list-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesTable {
  readonly rows = input.required<readonly RoleRow[]>();

  protected readonly view = computed(() => {
    const rows = this.rows();
    return createTableView<RoleRow>({
      rows: signal(rows),
      searchText: (row) => [row.name],
      filters: roleFilters(rows),
    });
  });

  protected readonly viewLink = ROLE_VIEW_LINK;
}
