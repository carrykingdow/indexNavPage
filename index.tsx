import { View, ScrollView, Image } from '@tarojs/components'
import Taro, { Component } from '@tarojs/taro'
import { routeURL } from '@/modules/growjs/router'
import config from '@/modules/growjs/config'
import './index.scss'

interface IProps {}
interface IState {
	navList: Array<any>
	mainList: Array<any>
	navIndex: number
	mainIndex: number
	navTop: number
}

export default class Index extends Component<IProps> {
	private isFirstScroll: boolean = false

	state: IState = {
		navList: [],
		mainList: [],
		navIndex: 0,
		mainIndex: 0,
		navTop: 0
	}
	setNavListHandler(): void {
		let list = [] as any
		for (let i = 0; i < 26; i++) {
			list[i] = { key: String.fromCharCode(65 + i) }
		}
		this.setState({ navList: [ { key: '*' }, { key: '热' }, ...list ] })
	}

	setMainListHandler(): void {
		let list = [] as any
		for (let i = 0; i < 26; i++) {
			list[i] = { key: String.fromCharCode(65 + i) }
		}
		this.setState({ mainList: [ { key: '*' }, { key: '热' }, ...list ] })
	}

	setIndexCurHandler(index: number | string): void {
		this.setState({ mainIndex: index, navIndex: index })
	}

	getMainItemHandler(): void {
		let { mainList } = this.state
		// 只在初次滚动的时候计算每个节点的位置
		if (!this.isFirstScroll) {
			mainList.forEach((item, index) => {
				Taro.createSelectorQuery()
					.in(this.$scope)
					.select(`#section-${index}`)
					.boundingClientRect(function(rect: any) {
						mainList[index].top = rect.top
						mainList[index].bottom = rect.bottom
					})
					.exec()
			})
			this.isFirstScroll = true
			this.setState({ mainList })
		}
	}

	scrollCurHandler(e: { detail: { scrollTop: any } }): void {
		this.getMainItemHandler()
		let { mainList } = this.state
		const CUSTOM_NAV_BAR_HEIGHT = config.get('customNavBarHeight') || 0
		const SEARCH_HEIGHT = 44
		const PADDING_HEIGHT = 10
		const BOUNDARY_DISTANCE = CUSTOM_NAV_BAR_HEIGHT + SEARCH_HEIGHT + PADDING_HEIGHT
		let scrollTop = e.detail.scrollTop + BOUNDARY_DISTANCE
		const mainListLen = mainList.length
		for (let index = 0; index < mainListLen; index++) {
			if (scrollTop > mainList[index].top && scrollTop < mainList[index].bottom) {
				this.setState({ navIndex: index })
			}
		}
	}

	getNavTop(): void {
		Taro.createSelectorQuery()
			.in(this.$scope)
			.select(`.nav-bar-inner`)
			.boundingClientRect((rect: any) => {
				this.setState({ navTop: rect.top })
			})
			.exec()
	}

	navTouchMoveHandler(e: { touches: { clientY: any }[] }): void {
		this.getMainItemHandler()
		let touchY: number = Number(e.touches[0].clientY)
		let { navTop = 0, navList } = this.state
		const NAV_ITEM_HEIGHT = 16
		if (touchY > navTop) {
			let curItem = Math.floor((touchY - navTop) / NAV_ITEM_HEIGHT)
			if (curItem >= navList.length) curItem = navList.length - 1
			this.setState({ navIndex: curItem })
		}
	}

	navTouchEndHandler(e: { stopPropagation: () => void }) {
		e.stopPropagation()
		this.setIndexCurHandler(this.state.navIndex)
	}

	navigatorHandler(url: string): void {
		if (!url) return
		routeURL(`https://host?cmd=${url}`)
	}

	componentDidMount() {
		this.getNavTop()
		this.setNavListHandler()
		this.setMainListHandler()
	}
	render() {
		const CUSTOM_NAV_BAR_HEIGHT: number = config.get('customNavBarHeight') || 0
		const SEARCH_HEIGHT: number = 44
		const BOUNDARY_DISTANCE: number = CUSTOM_NAV_BAR_HEIGHT + SEARCH_HEIGHT
		const { navList, navIndex, mainList, mainIndex } = this.state
		return (
			<View className={`${config.get('$app').skin_name} 'brand-wrap'`} style={`height: calc(100vh - ${BOUNDARY_DISTANCE}px)`}>
				<ScrollView className='scroll-wrap' scrollY scrollWithAnimation enableBackToTop scrollIntoView={`section-${mainIndex}`} onScroll={this.scrollCurHandler.bind(this)}>
					{mainList.map((item, index) => (
						<View className='brand-section' key={index}>
							{/* TODO:// 获取正式接口数据后，不能使用 index = 0来判断，应使用flag 区分关注与热门 */}
							{/* 关注*/}
							{index == 0 && (
								<View className='section-attention' id={`section-${index}`} key={index}>
									<View className='attention-title'>
										<View className='title'>关注品牌</View>
										<View className='more hasArrow'>更多关注</View>
									</View>
									<View className='attention-list'>
										{[ 1, 3, 2, 1, 23, 3 ].map((subItem, subIndex) => (
											<View className='attention-item' key={subIndex} onClick={this.navigatorHandler.bind(this)}>
												<Image className='item-img' mode='aspectFill' src='' />
											</View>
										))}
									</View>
								</View>
							)}
							{/* 热门 */}
							{index == 1 && (
								<View className='section-attention' id={`section-${index}`} key={index}>
									<View className='attention-title'>热门品牌</View>
									<View className='attention-list'>
										{[ 1, 3, 2, 1, 23, 3 ].map((subItem, subIndex) => (
											<View className='attention-item' key={subIndex} onClick={this.navigatorHandler.bind(this)}>
												<Image className='item-img' mode='aspectFill' src='' />
											</View>
										))}
									</View>
								</View>
							)}
							{/* 字母分类 */}
							{index > 1 && (
								<View className='section-normal' id={`section-${index}`} key={index}>
									<View className='normal-title'>{item.key}</View>
									<View className='normal-list'>
										{[ 1 ].map((subItem, subIndex) => (
											<View className='normal-item' key={subIndex} onClick={this.navigatorHandler.bind(this)}>
												<View className='thumbnail'>
													<Image className='item-img' mode='aspectFill' src='' />
												</View>
												<View className='item-desc'>A LANCOMEA LANCOMEA LANCOMEA LANCOMEA LANCOME</View>
											</View>
										))}
									</View>
								</View>
							)}
						</View>
					))}
				</ScrollView>
				{/* 右侧导航 */}
				<View className='nav-bar-wrap'>
					<View className='nav-bar-inner' onTouchMove={this.navTouchMoveHandler.bind(this)}>
						{navList.map(
							(item, index) =>
								index == 0 ? (
									<View
										className={`nav-item nav-item-icon ${index == navIndex && 'cur'}`}
										key={index}
										onClick={this.setIndexCurHandler.bind(this, index)}
										onTouchEnd={this.navTouchEndHandler.bind(this)}
									/>
								) : (
									<View
										className={`nav-item ${index == navIndex && 'cur'}`}
										key={index}
										onClick={this.setIndexCurHandler.bind(this, index)}
										onTouchEnd={this.navTouchEndHandler.bind(this)}
									>
										{item.key}
									</View>
								)
						)}
					</View>
				</View>
			</View>
		)
	}
}
