# WRTeam presentation kit

A Claude Code plugin that builds marketplace presentations for our UI kits the same way for everyone on the team.

You give Claude a Figma link. Claude analyses the kit, proposes a 15-image deck in a style from our style library, and waits for your approval. It then builds the deck in Figma, checks it, and waits for your review. Finally it exports the images, publishes them and gives you the HTML for the marketplace item page.

## Install (once)

In Claude Code:

```
/plugin marketplace add wrteam-adityasinh/Presentation-Assets#plugin
/plugin install marketplace-presentation@wrteam
```

The plugin lives on the `plugin` branch of the same repo that holds the presentation images. Images go to `main`.

Without a GitHub SSH key, set `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` in your environment before adding the marketplace, and run `gh auth login` then `gh auth setup-git` once.

You also need:

- The **Figma plugin** for Claude Code, signed in with your own Figma account. You need edit access to the product's Figma file.
- **Write access** to `wrteam-adityasinh/Presentation-Assets` on GitHub. Ask the owner to add you as a collaborator. Use your own GitHub login; never share tokens.
- **git**, **curl** and **Python 3 with Pillow** (`pip install pillow`).

## Use

| You have | Do this |
|---|---|
| Only a Figma file | `/marketplace-presentation https://www.figma.com/design/<fileKey>/<Product>` |
| Code and a Figma file | Open Claude Code in the product's code folder, then run the same command with the Figma link. Features also come from the code, and a tech-stack slide is added |
| Only code | Create an **empty** Figma design file in the team's Figma project. Open Claude Code in the code folder and run the command with that empty file's link. Claude runs the app, captures every screen into the file and builds the presentation there |

Only the final presentation images are ever pushed to GitHub. Code, captured screens and screenshots never leave your machine and the Figma file.

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

## Who can change what

| Branch | What lives there | Who can change it |
|---|---|---|
| `main` | Presentation images, `registry/products.json`, README | Every collaborator, pushing directly (no review) |
| `plugin` | This plugin | Only the repo owner pushes directly. Everyone else opens a pull request and the owner approves it |
| Tags `*-v*` | Published image versions used by live item pages | Anyone can create a new tag. Only the owner can move or delete one |

## Changing the standard

1. Create a branch from `plugin`, for example `git switch -c fix-features-guide origin/plugin`.
2. Edit the files and bump `version` in `plugins/marketplace-presentation/.claude-plugin/plugin.json`.
3. Push the branch and open a pull request into `plugin`.
4. The owner reviews and merges it. Teammates then run `/plugin marketplace update wrteam` and `/plugin update marketplace-presentation`.
