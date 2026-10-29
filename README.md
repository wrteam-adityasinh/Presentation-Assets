# WRTeam presentation kit

A Claude Code plugin that builds marketplace presentations for our UI kits the same way for everyone on the team.

You give Claude a Figma link. Claude analyses the kit, proposes a 15-image deck in a style from our style library, and waits for your approval. It then builds the deck in Figma, checks it, and waits for your review. Finally it exports the images, publishes them and gives you the HTML for the marketplace item page.

## Install (once)

In Claude Code:

```
/plugin marketplace add <owner>/claude-presentation-kit
/plugin install marketplace-presentation@wrteam
```

You also need:

- The **Figma plugin** for Claude Code, signed in with your own Figma account. You need edit access to the product's Figma file.
- **Write access** to `wrteam-adityasinh/Presentation-Assets` on GitHub. Ask the owner to add you as a collaborator. Use your own GitHub login; never share tokens.
- **git**, **curl** and **Python 3 with Pillow** (`pip install pillow`).

## Use

```
/marketplace-presentation https://www.figma.com/design/<fileKey>/<Product>
```

Claude stops twice:

1. **Plan**: check the verified numbers, the key features, the style and the slide plan. Reply "go", or tell it what to change.
2. **Review**: open the new "🖼 Presentation" page in Figma and review every slide. You own this review. Edit slides by hand if you like, then reply "export" with the live-preview link.

Later, if you change slides in Figma, say "I updated some sections". Claude replaces only the changed images, bumps the tag and gives you the new HTML.

## Update the plugin

```
/plugin update marketplace-presentation
```

## What is inside

- `plugins/marketplace-presentation/skills/marketplace-presentation/SKILL.md`: the process
- `references/`: design rules, slide blueprints, features guide, Figma gotchas, QA checklist, publish pipeline
- `references/style-library/`: 10 style recipes (7 from shipped decks, 3 new)
- `scripts/`: Figma builder kit, analysis scripts, export, publish, registry and HTML generator

## Changing the standard

Edit the files, bump `version` in `plugins/marketplace-presentation/.claude-plugin/plugin.json`, commit and push. Teammates run `/plugin update`.
