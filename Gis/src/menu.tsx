export type MenuItem = {
  id?: number
  label: string
  group: 'top' | 'middle' | 'bottom'
  onClick: () => void
  onSearch?: (query: string) => void

  basemapKey?: string
}

type SidebarProps = {
  menuItems: MenuItem[]
  activeBasemap?: string
}

function Sidebar({ menuItems, activeBasemap }: SidebarProps) {

  // filter group
  const topItems    = menuItems.filter((item) => item.group === 'top')
  const middleItems = menuItems.filter((item) => item.group === 'middle')
  const bottomItems = menuItems.filter((item) => item.group === 'bottom')

  return (
    <aside className="sidebar">

      <div className="menu-group-top">
        {topItems.map((item) => (
          <input
            key={item.id}
            type="text"
            placeholder="Search..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                item.onSearch?.((e.target as HTMLInputElement).value)
              }
            }}
          />
        ))}
      </div>

      <div className="menu-group-middle">
        {middleItems.map((item) => (
          <div
            key={item.id}
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => console.log('dropped')}
          >
            {item.label}
          </div>
        ))}
      </div>

      <div className="menu-group-bottom">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={[
              "btn",
              item.basemapKey && item.basemapKey === activeBasemap ? 'active' : ''
            ].join(' ').trim()}
          >
            {item.label}
          </button>
        ))}
      </div>

    </aside>
  )
}

export default Sidebar