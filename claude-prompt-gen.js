#!/usr/bin/env node
/**
 * Claude Prompt Generator - Generate CLAUDE.md files for Cline projects.
 * 
 * Usage:
 *     claude-prompt-gen.js --name "My Project" --lang python
 * 
 * Creates a CLAUDE.md with project-specific instructions.
 */

const fs = require('fs');
const path = require('path');

const PYTHON_PROMPTS = {
    framework: "You are an expert Python developer. Follow PEP 8 style guidelines.",
    test: "Write tests using pytest. Ensure 80% code coverage.",
    doc: "Include docstrings for all functions and classes.",
};

const JS_PROMPTS = {
    framework: "You are an expert JavaScript/TypeScript developer. Follow modern ES6+ patterns.",
    test: "Write tests using Jest. Follow TDD principles.",
    doc: "Include JSDoc comments for all functions.",
};

const LANGUAGES = {
    python: PYTHON_PROMPTS,
    javascript: JS_PROMPTS,
    typescript: JS_PROMPTS,
};

const DEFAULT_PROMPT = `# Claude Instructions

You are an expert software developer. Follow these guidelines:
- Write clean, maintainable code
- Include appropriate comments
- Consider security best practices
- Write tests for your code
`;

function generatePrompt(name, options = {}) {
    let prompt = `# Project: ${name}

${DEFAULT_PROMPT}
`;

    if (options.language && LANGUAGES[options.language]) {
        prompt += `\n## Language\n\n${LANGUAGES[options.language].framework}\n`;
    }

    if (options.includeTests !== false) {
        prompt += "\n## Testing\n\n";
        if (options.language && LANGUAGES[options.language]) {
            prompt += `${LANGUAGES[options.language].test}\n`;
        } else {
            prompt += "Write comprehensive tests for all features.\n";
        }
    }

    if (options.includeDocs !== false) {
        prompt += "\n## Documentation\n\n";
        if (options.language && LANGUAGES[options.language]) {
            prompt += `${LANGUAGES[options.language].doc}\n`;
        } else {
            prompt += "Document all public APIs and complex logic.\n";
        }
    }

    if (options.framework) {
        prompt += `\n## Framework\n\nUsing ${options.framework}. Follow framework-specific best practices.\n`;
    }

    return prompt;
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`Usage: claude-prompt-gen.js --name <project> [options]

Options:
  --name <project>     Project name (required)
  --lang <python|javascript|typescript>  Language
  --framework <name>   Framework name
  --no-tests           Skip test instructions
  --no-docs           Skip documentation instructions

Examples:
  claude-prompt-gen.js --name "API" --lang python --framework fastapi
  claude-prompt-gen.js --name "WebApp" --lang typescript --framework react`);
        process.exit(1);
    }
    
    let name = null;
    let options = {};
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--name' && args[i + 1]) {
            name = args[i + 1];
            i++;
        } else if (arg === '--lang' && args[i + 1]) {
            options.language = args[i + 1];
            i++;
        } else if (arg === '--framework' && args[i + 1]) {
            options.framework = args[i + 1];
            i++;
        } else if (arg === '--no-tests') {
            options.includeTests = false;
        } else if (arg === '--no-docs') {
            options.includeDocs = false;
        }
    }
    
    if (!name) {
        console.log('Error: --name is required');
        process.exit(1);
    }
    
    const prompt = generatePrompt(name, options);
    
    // Write to CLAUDE.md
    const outputPath = path.join(process.cwd(), 'CLAUDE.md');
    fs.writeFileSync(outputPath, prompt);
    
    console.log(`✓ Created CLAUDE.md for '${name}'`);
    if (options.language) console.log(`  Language: ${options.language}`);
    if (options.framework) console.log(`  Framework: ${options.framework}`);
    console.log(`  Tests: ${options.includeTests !== false}`);
    console.log(`  Docs: ${options.includeDocs !== false}`);
}

main();
