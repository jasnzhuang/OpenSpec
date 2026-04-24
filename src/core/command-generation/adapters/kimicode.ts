/**
 * Kimicode CLI Command Adapter
 *
 * Formats commands for Kimicode CLI following its command specification.
 * Kimicode commands don't use frontmatter.
 */

import path from 'path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';

/**
 * Kimicode CLI adapter for command generation.
 * File path: .kimicode/commands/opsx-<id>.md
 * Format: Plain markdown without frontmatter
 */
export const kimicodeAdapter: ToolCommandAdapter = {
  toolId: 'kimicode',

  getFilePath(commandId: string): string {
    return path.join('.kimicode', 'commands', `opsx-${commandId}.md`);
  },

  formatFile(content: CommandContent): string {
    return `${content.body}
`;
  },
};
