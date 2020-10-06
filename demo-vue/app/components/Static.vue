<template>
	<Page>
		<ActionBar title="Static"/>
		<StackLayout iosOverflowSafeArea="false">
			<Pager height="100%" :selectedIndex="1" orientation="vertical">
				<PagerItem backgroundColor="red">
					<Label text="First"></Label>
				</PagerItem>
				<PagerItem backgroundColor="white">
					<Label text="Second"></Label>
				</PagerItem>
				<PagerItem backgroundColor="black">
					<Label text="Third" color="white"></Label>
				</PagerItem>
				<PagerItem backgroundColor="green">
					<Label text="Fourth"></Label>
				</PagerItem>
			</Pager>
		</StackLayout>
	</Page>
</template>

<script>
	export default {};
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
