// Note Templates for structured learning notes
import { NoteTemplate, NoteTemplateType } from '@/types';

export const NOTE_TEMPLATES: Record<NoteTemplateType, NoteTemplate> = {
  blank: {
    id: 'blank',
    name: 'Blank Note',
    description: 'Start with an empty note',
    content: '',
  },
  concept: {
    id: 'concept',
    name: 'Concept Summary',
    description: 'Structured template for learning new concepts',
    content: `<h2>📚 Concept Name</h2>
<p><em>Brief description of what this concept is about</em></p>

<h3>🎯 What is it?</h3>
<p>Define the concept in your own words...</p>

<h3>❓ Why does it matter?</h3>
<p>Explain why this concept is important for Data Engineering...</p>

<h3>🔧 How does it work?</h3>
<p>Describe the mechanism or process...</p>

<h3>💡 Key Points</h3>
<ul>
<li>Important point 1</li>
<li>Important point 2</li>
<li>Important point 3</li>
</ul>

<h3>📝 Code Example</h3>
<pre><code class="language-python"># Your code example here
</code></pre>

<h3>🔗 Related Concepts</h3>
<p>List related topics or concepts to explore...</p>

<h3>📖 Resources</h3>
<ul>
<li><a href="">Resource 1</a></li>
<li><a href="">Resource 2</a></li>
</ul>`,
  },
  tutorial: {
    id: 'tutorial',
    name: 'Tutorial Notes',
    description: 'Step-by-step notes for following tutorials',
    content: `<h2>📺 Tutorial: [Title]</h2>
<p><strong>Source:</strong> <a href="">Link to tutorial</a></p>
<p><strong>Duration:</strong> </p>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

<h3>📋 Overview</h3>
<p>What this tutorial covers...</p>

<h3>🎯 Learning Goals</h3>
<ul>
<li>Goal 1</li>
<li>Goal 2</li>
</ul>

<h3>📝 Step-by-Step Notes</h3>

<h4>Step 1: Setup</h4>
<p>Notes for step 1...</p>
<pre><code class="language-bash"># Commands used
</code></pre>

<h4>Step 2: Implementation</h4>
<p>Notes for step 2...</p>

<h4>Step 3: Testing</h4>
<p>Notes for step 3...</p>

<h3>⚠️ Issues & Solutions</h3>
<p>Document any problems encountered and how you solved them...</p>

<h3>✅ Key Takeaways</h3>
<ul>
<li>Takeaway 1</li>
<li>Takeaway 2</li>
</ul>

<h3>🚀 Next Steps</h3>
<p>What to practice or learn next...</p>`,
  },
  troubleshooting: {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Document errors and their solutions',
    content: `<h2>🐛 Problem: [Brief Description]</h2>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Context:</strong> What were you trying to do?</p>

<h3>❌ Error Message</h3>
<pre><code>Paste the full error message here
</code></pre>

<h3>🔍 Environment</h3>
<ul>
<li><strong>OS:</strong> </li>
<li><strong>Tool/Framework:</strong> </li>
<li><strong>Version:</strong> </li>
</ul>

<h3>📋 What I Tried</h3>
<ol>
<li>First attempted solution...</li>
<li>Second attempted solution...</li>
</ol>

<h3>✅ Solution</h3>
<p>What finally fixed the issue:</p>
<pre><code class="language-bash"># The fix
</code></pre>

<h3>💡 Root Cause</h3>
<p>Why this happened...</p>

<h3>🛡️ Prevention</h3>
<p>How to avoid this in the future...</p>

<h3>🔗 Helpful Resources</h3>
<ul>
<li><a href="">StackOverflow link</a></li>
<li><a href="">Documentation</a></li>
</ul>`,
  },
  cheatsheet: {
    id: 'cheatsheet',
    name: 'Cheatsheet',
    description: 'Quick reference guide for commands and syntax',
    content: `<h2>📋 Cheatsheet: [Topic]</h2>
<p><em>Quick reference for commonly used commands/syntax</em></p>

<h3>🚀 Quick Start</h3>
<pre><code class="language-bash"># Most common command
</code></pre>

<h3>📦 Setup & Installation</h3>
<pre><code class="language-bash"># Installation commands
</code></pre>

<h3>🔧 Basic Commands</h3>
<table>
<tr><th>Command</th><th>Description</th></tr>
<tr><td><code>command1</code></td><td>What it does</td></tr>
<tr><td><code>command2</code></td><td>What it does</td></tr>
</table>

<h3>💡 Common Patterns</h3>
<pre><code class="language-python"># Pattern 1: Name
code here

# Pattern 2: Name  
code here
</code></pre>

<h3>⚠️ Common Mistakes</h3>
<ul>
<li><strong>❌ Wrong:</strong> <code>wrong_code</code></li>
<li><strong>✅ Right:</strong> <code>correct_code</code></li>
</ul>

<h3>📚 Examples</h3>

<h4>Example 1: Basic Usage</h4>
<pre><code class="language-python"># Example code
</code></pre>

<h4>Example 2: Advanced Usage</h4>
<pre><code class="language-python"># Advanced example
</code></pre>

<h3>🔗 Documentation</h3>
<ul>
<li><a href="">Official Docs</a></li>
</ul>`,
  },
  review: {
    id: 'review',
    name: 'Review Note',
    description: 'Spaced repetition review template',
    content: `<h2>🔄 Review: [Topic]</h2>
<p><strong>Original Note:</strong> <em>Link to original note</em></p>
<p><strong>Review Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Review #:</strong> 1</p>

<h3>❓ Self-Test Questions</h3>
<ol>
<li><strong>Q:</strong> What is [concept]?
<p><em>Your answer (try before looking at notes)...</em></p></li>
<li><strong>Q:</strong> When would you use [concept]?
<p><em>Your answer...</em></p></li>
<li><strong>Q:</strong> How does [concept] differ from [related concept]?
<p><em>Your answer...</em></p></li>
</ol>

<h3>📊 Confidence Level</h3>
<p>Rate your understanding: ⭐⭐⭐☆☆ (3/5)</p>

<h3>🧠 What I Remember</h3>
<p>Write what you remember without looking at notes...</p>

<h3>📝 What I Forgot/Got Wrong</h3>
<p>After checking notes, what did you miss?</p>

<h3>💡 New Connections</h3>
<p>Any new insights or connections to other concepts?</p>

<h3>📅 Next Review</h3>
<p><strong>Suggested:</strong> ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
<p><strong>Focus areas:</strong> List topics to focus on next time</p>`,
  },
};

export function getTemplateContent(templateId: NoteTemplateType): string {
  return NOTE_TEMPLATES[templateId]?.content || '';
}

export function getTemplateList(): { id: NoteTemplateType; name: string; description: string }[] {
  return Object.values(NOTE_TEMPLATES).map(({ id, name, description }) => ({
    id,
    name,
    description,
  }));
}
