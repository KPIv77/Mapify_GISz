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
            {menuHeader.map((item) => (
                <button
                    key={item.label}
                    onClick={item.onClick}
                    className="btn"
                >
                    {item.label}
                </button>
            ))}
        </>
    )

}

export default HeaderMenu
