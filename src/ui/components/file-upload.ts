/**
 * FileUpload Lit Component
 *
 * An overlay button that lets users load a Tuist graph JSON file via
 * file picker or drag-and-drop. Dispatches a `graph-file-loaded` custom
 * event with the parsed raw JSON as detail.
 *
 * @fires graph-file-loaded - Dispatched when a valid JSON file is loaded (detail: { raw: unknown })
 */

import { ErrorCategory } from '@shared/schemas/error.types';
import { icons } from '@shared/utils/icon-adapter';
import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ErrorService } from '@/services/error-service';

/**
 * Overlay button for loading a Tuist graph JSON file via file picker or drag-and-drop.
 *
 * @summary File upload button with drag-and-drop support
 * @fires graph-file-loaded - Dispatched when a valid JSON file is loaded (detail: { raw: unknown })
 */
export class GraphFileUpload extends LitElement {
  @state()
  private declare isDragOver: boolean;

  constructor() {
    super();
    this.isDragOver = false;
  }

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      position: absolute;
      bottom: var(--spacing-md);
      left: var(--spacing-md);
      z-index: 10;
    }

    .container {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2) var(--spacing-3);
      background-color: color-mix(in srgb, var(--colors-card) 95%, transparent);
      border: var(--border-widths-thin) solid color-mix(in srgb, var(--colors-primary) 30%, transparent);
      border-radius: var(--radii-md);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
      cursor: pointer;
      transition:
        border-color var(--durations-fast) var(--easings-out),
        background-color var(--durations-fast) var(--easings-out);
    }

    .container:hover {
      background-color: color-mix(in srgb, var(--colors-foreground) 5%, transparent);
    }

    .container.drag-over {
      border-color: var(--colors-primary);
      background-color: color-mix(in srgb, var(--colors-primary) 10%, transparent);
      color: var(--colors-primary-text);
    }

    .container:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }

    .icon svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }

    input[type="file"] {
      display: none;
    }
  `;

  /** Opens the hidden file input dialog */
  private handleClick() {
    const input = this.shadowRoot?.querySelector<HTMLInputElement>('input[type="file"]');
    input?.click();
  }

  /** Handles keyboard activation (Enter/Space) to open file dialog */
  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleClick();
    }
  }

  /** Handles file input change and reads the selected file */
  private handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.readFile(file);
    }
    input.value = '';
  }

  /** Handles dragover to enable drop and show visual feedback */
  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = true;
  }

  /** Handles dragleave to reset visual feedback */
  private handleDragLeave() {
    this.isDragOver = false;
  }

  /** Handles file drop and reads the dropped file */
  private handleDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = false;
    const file = e.dataTransfer?.files[0];
    if (file) {
      this.readFile(file);
    }
  }

  /** Reads a file as text, parses JSON, and dispatches graph-file-loaded event */
  private readFile(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string);
        this.dispatchEvent(
          new CustomEvent('graph-file-loaded', {
            detail: { raw },
            bubbles: true,
            composed: true,
          }),
        );
      } catch {
        ErrorService.getInstance().handleError(new Error(`Invalid JSON in file "${file.name}"`), {
          category: ErrorCategory.Data,
          userMessage: `Could not parse "${file.name}" — the file does not contain valid JSON`,
        });
      }
    };

    reader.onerror = () => {
      ErrorService.getInstance().handleError(new Error(`Failed to read file "${file.name}"`), {
        category: ErrorCategory.Data,
        userMessage: `Could not read "${file.name}" — please try again`,
      });
    };

    reader.readAsText(file);
  }

  /** Renders the component template */
  override render(): TemplateResult {
    return html`
      <div
        class=${classMap({ container: true, 'drag-over': this.isDragOver })}
        role="button"
        tabindex="0"
        aria-label="Upload graph JSON file"
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
        @dragover=${this.handleDragOver}
        @dragleave=${this.handleDragLeave}
        @drop=${this.handleDrop}
      >
        <span class="icon">${icons.Upload}</span>
        <span>Load graph JSON</span>
        <input type="file" accept=".json" @change=${this.handleFileChange} />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-file-upload': GraphFileUpload;
  }
}

if (!customElements.get('xcode-graph-file-upload')) {
  customElements.define('xcode-graph-file-upload', GraphFileUpload);
}
