export type MenuHeader = {
  label: string
  onClick: () => void
}

type HeaderProps = {
  menuHeader: MenuHeader[]
}

function HeaderMenu({ menuHeader }: HeaderProps) {

    return (
        <>
            <div className="header-menu">
                {menuHeader.map((item) => (
                    <button
                        onClick={item.onClick}
                        className="btn"
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </>
    )

}

export default HeaderMenu