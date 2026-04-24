import { describe, it, expect } from 'vitest';
import { CommandAdapterRegistry } from '../../../src/core/command-generation/registry.js';

describe('command-generation/registry', () => {
  describe('get', () => {
    it('should return Claude adapter for "claude"', () => {
      const adapter = CommandAdapterRegistry.get('claude');
      expect(adapter).toBeDefined();
      expect(adapter?.toolId).toBe('claude');
    });

    it('should return Cursor adapter for "cursor"', () => {
      const adapter = CommandAdapterRegistry.get('cursor');
      expect(adapter).toBeDefined();
      expect(adapter?.toolId).toBe('cursor');
    });

    it('should return Windsurf adapter for "windsurf"', () => {
      const adapter = CommandAdapterRegistry.get('windsurf');
      expect(adapter).toBeDefined();
      expect(adapter?.toolId).toBe('windsurf');
    });

    it('should return Junie adapter for "junie"', () => {
      const adapter = CommandAdapterRegistry.get('junie');
      expect(adapter).toBeDefined();
      expect(adapter?.toolId).toBe('junie');
    });

    it('should return undefined for unregistered tool', () => {
      const adapter = CommandAdapterRegistry.get('unknown-tool');
      expect(adapter).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const adapter = CommandAdapterRegistry.get('');
      expect(adapter).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return array of all registered adapters', () => {
      const adapters = CommandAdapterRegistry.getAll();
      expect(Array.isArray(adapters)).toBe(true);
      expect(adapters.length).toBeGreaterThanOrEqual(3); // At least Claude, Cursor, Windsurf
    });

    it('should include Claude, Cursor, and Windsurf adapters', () => {
      const adapters = CommandAdapterRegistry.getAll();
      const toolIds = adapters.map((a) => a.toolId);

      expect(toolIds).toContain('claude');
      expect(toolIds).toContain('cursor');
      expect(toolIds).toContain('windsurf');
    });
  });

  describe('has', () => {
    it('should return true for registered tools', () => {
      expect(CommandAdapterRegistry.has('claude')).toBe(true);
      expect(CommandAdapterRegistry.has('cursor')).toBe(true);
      expect(CommandAdapterRegistry.has('windsurf')).toBe(true);
      expect(CommandAdapterRegistry.has('junie')).toBe(true);
    });

    it('should return false for unregistered tools', () => {
      expect(CommandAdapterRegistry.has('unknown')).toBe(false);
      expect(CommandAdapterRegistry.has('')).toBe(false);
    });
  });

  describe('adapter functionality', () => {
    it('registered adapters should have working getFilePath', () => {
      const claudeAdapter = CommandAdapterRegistry.get('claude');
      const cursorAdapter = CommandAdapterRegistry.get('cursor');
      const windsurfAdapter = CommandAdapterRegistry.get('windsurf');

      expect(claudeAdapter?.getFilePath('test')).toContain('.claude');
      expect(cursorAdapter?.getFilePath('test')).toContain('.cursor');
      expect(windsurfAdapter?.getFilePath('test')).toContain('.windsurf');
    });

    it('registered adapters should have working formatFile', () => {
      const content = {
        id: 'test',
        name: 'Test',
        description: 'Test desc',
        category: 'Test',
        tags: ['tag1'],
        body: 'Body content',
      };

      // Tools that don't use YAML frontmatter (markdown headers or TOML or plain)
      const noYamlFrontmatter = ['cline', 'kilocode', 'kimicode', 'roocode', 'gemini', 'qwen'];

      const adapters = CommandAdapterRegistry.getAll();
      for (const adapter of adapters) {
        const output = adapter.formatFile(content);
        // All adapters should include the body content
        expect(output).toContain('Body content');
        // Only check for YAML frontmatter for tools that use it
        if (!noYamlFrontmatter.includes(adapter.toolId)) {
          expect(output).toContain('---');
        }
      }
    });
  });

  describe('getCommandSurface', () => {
    it('should return "adapter" for tools with a registered adapter (inferred)', () => {
      expect(CommandAdapterRegistry.getCommandSurface('claude')).toBe('adapter');
      expect(CommandAdapterRegistry.getCommandSurface('cursor')).toBe('adapter');
      expect(CommandAdapterRegistry.getCommandSurface('windsurf')).toBe('adapter');
    });

    it('should return "none" for tools with no registered adapter and no override', () => {
      expect(CommandAdapterRegistry.getCommandSurface('forgecode')).toBe('none');
      expect(CommandAdapterRegistry.getCommandSurface('unknown-tool')).toBe('none');
    });

    it('should return the explicit override when provided', () => {
      expect(CommandAdapterRegistry.getCommandSurface('trae', 'skills-invocable')).toBe('skills-invocable');
      expect(CommandAdapterRegistry.getCommandSurface('claude', 'none')).toBe('none');
      expect(CommandAdapterRegistry.getCommandSurface('unknown', 'adapter')).toBe('adapter');
    });

    it('should return "skills-invocable" for Trae using its config metadata', async () => {
      const { AI_TOOLS } = await import('../../../src/core/config.js');
      const trae = AI_TOOLS.find((t) => t.value === 'trae');
      expect(trae).toBeDefined();
      expect(CommandAdapterRegistry.getCommandSurface('trae', trae?.commandSurface)).toBe('skills-invocable');
    });

    it('should infer "adapter" when explicit override matches inferred value', () => {
      expect(CommandAdapterRegistry.getCommandSurface('claude', 'adapter')).toBe('adapter');
    });
  });
});
