interface headingObject {
  tag: string,
  text: string,
  id: string
}

class TableOfContents {
  private depth = 0;
  private depthMap: Map<string, number> = new Map([
    ['h2', 1],
    ['h3', 2],
    ['h4', 3],
    ['h5', 4],
    ['h6', 5]
  ])
  private headings: headingObject[];

  constructor(headings: headingObject[]) {
    this.headings = headings
  }

  generate(): string {
    if (!this.headings.length) {
      return ''
    }
    return this.privateGenerate()
  }

  private privateGenerate(index: number = 0, result: string = ''): string {
    if (!(index <= this.headings.length - 1)) {
      if (this.depth > 0) {
        result += this.closeChild()
        return this.privateGenerate(index, result)
      }
      return result
    }
    const hObject: headingObject = this.headings[index]
    const depth: number | undefined = this.depthMap.get(hObject.tag)
    if (depth === undefined) {
      return this.privateGenerate(++index, result)
    } else if (depth === this.depth) {
      result += this.generateSibling()
      result += `<a href="#${hObject.id}">${hObject.text}</a>`
      return this.privateGenerate(++index, result)
    } else if (depth < this.depth) {
      result += this.closeChild()
      return this.privateGenerate(index, result)
    } else {
      result += this.openChild()
      if (depth === this.depth) {
        result += `<a href="#${hObject.id}">${hObject.text}</a>`
        return this.privateGenerate(++index, result)
      }
      return this.privateGenerate(index, result)
    }
  }
  private generateSibling() {
    return '</li><li>'
  }
  private openChild() {
    ++this.depth
    return '<ol><li>'
  }
  private closeChild() {
    --this.depth
    return '</li></ol>'
  }
}
const headingNodes = document.querySelectorAll('h2,h3,h4,h5,h6')
const list = Array.from(headingNodes)
list.forEach(node => {
  if (!node.id) {
    node.id = (node.textContent || '').toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s/g, '-')
  }
});
const headings: headingObject[] = list.map((node) => ({ tag: node.tagName.toLowerCase(), text: node.textContent || '', id: node.id }))
const toc = new TableOfContents(headings).generate()
const tocElements = Array.from(document.getElementsByClassName('toc'))
tocElements.forEach((el) => {
  el.innerHTML = toc
})