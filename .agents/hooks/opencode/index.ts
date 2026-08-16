import type { Plugin } from '@opencode-ai/plugin'
import { sessionLogHooks } from './session-log'
import { surfaceKnowledgeHook } from './surface-knowledge'
import { surfaceOutstandingHook } from './surface-outstanding'
import { toolGuardHook } from './tool-guard'

export const AgentHooksPlugin: Plugin = async ({ directory }) => {
  const log = sessionLogHooks({ directory })
  const guard = toolGuardHook()
  const outstanding = surfaceOutstandingHook({ directory })
  const knowledge = surfaceKnowledgeHook({ directory })

  return {
    event: log.event,
    'tool.execute.before': async (input, output) => {
      await log['tool.execute.before'](input, output)
      await guard(input, output)
    },
    'tool.execute.after': log['tool.execute.after'],
    'experimental.chat.system.transform': async (input, output) => {
      await outstanding(input, output)
      await knowledge(input, output)
    },
  }
}

export default AgentHooksPlugin
