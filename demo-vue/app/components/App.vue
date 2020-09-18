<template>
	<Page>
		<ActionBar title="Welcome to NativeScript-Vue!"/>
		<ActionBar title="Master"/>
		<StackLayout>
			<Button text="To Details directly" @tap="$navigateTo(detailPage)"/>
			<Button text="To Static" @tap="$navigateTo(staticPage)"/>
			<Button text="To 7" @tap="selectedIndex = 6"/>
			<Pager height="100%" for="item in items" :selectedIndex="selectedIndex" @selectedIndexChange="onIndexChanged">
				<v-template>
					<GridLayout class="pager-item" rows="auto, *" columns="*">
						<Label :text="item.title"></Label>
						<Image stretch="fill" row="1" :src="item.image"></Image>
					</GridLayout>
				</v-template>
			</Pager>
		</StackLayout>
	</Page>
</template>

<script>
	import Detail from './Detail'
	import Static from './Static';
	import { ObservableArray } from '@nativescript/core/data/observable-array';
	export default {
		data() {
			return {
				selectedIndex: 0,
				detailPage: Detail,
				staticPage: Static,
				items: new ObservableArray([
					{
						title: 'Slide 1',
						image: '~/assets/images/Hulk_(comics_character).png'
					},
					{
						title: 'Slide 2',
						image:
							'https://s-media-cache-ak0.pinimg.com/originals/4c/92/cc/4c92cc1dfbde6a6a40fe799f56fa9294.jpg'
					},
					{
						title: 'Slide 3',
						image:
							'https://images.unsplash.com/photo-1487715433499-93acdc0bd7c3?auto=format&fit=crop&w=2228&q=80'
					},
					{
						title: 'Slide 4',
						image:
							'http://img15.deviantart.net/60ea/i/2012/310/e/4/shazam_by_maiolo-d5k6fr5.jpg'
					},
					{
						title: 'Slide 5',
						image: 'https://i.annihil.us/u/prod/marvel/i/mg/d/f0/558982863130d.jpg'
					},
					{
						title: 'Slide 6',
						image:
							'https://images.unsplash.com/photo-1466872732082-8966b5959296?auto=format&fit=crop&w=2100&q=80'
					},
					{
						title: 'Slide 7',
						image:
							'https://images.unsplash.com/photo-1464061884326-64f6ebd57f83?auto=format&fit=crop&w=2100&q=80'
					},
					{
						title: 'Slide 8',
						image: 'https://i.ytimg.com/vi/DKbkKJWYT6E/maxresdefault.jpg'
					},
					{
						title: 'Slide 9',
						image:
							'http://otakukart.com/animeblog/wp-content/uploads/2016/04/Kurama-Naruto.png'
					},
					{
						title: 'Slide 10',
						image:
							'https://images.unsplash.com/photo-1474861644511-0f2775ae97cc?auto=format&fit=crop&w=2391&q=80'
					}
				])
			};
		},
		methods:{
			onIndexChanged(event){
				this.selectedIndex = event;
				console.log('onIndexChanged', event);
			}
		}
	};
</script>

<style scoped>
	ActionBar {
		background-color: #53ba82;
		color: #ffffff;
	}

	.message {
		vertical-align: center;
		text-align: center;
		font-size: 20;
		color: #333333;
	}
</style>
